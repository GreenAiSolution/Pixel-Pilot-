// ─── PIXEL PILOT · LIFECYCLE-AWARE AUDIENCES ─────────────────────────────────
// Server-only. Turns HubSpot lifecycle + deal truth into the three ad audiences
// Vector needs, as SHA-256-hashed membership deltas — so raw PII never leaves the
// backend. The n8n `audience-sync` workflow calls this, gets only hashes, and
// applies them to Meta/Google/TikTok behind an approval gate.
//
//   suppression → customers + closed-won contacts        (exclude from prospecting)
//   retarget    → warm, stalled open deals                (retarget)
//   seed        → closed-won contacts                     (lookalike seed)
//
// Flow: computeAudienceSpec() reads HubSpot, hashes, diffs vs the last committed
// snapshot in KV, stashes a pending snapshot, and returns deltas + an approval
// verdict. After a successful apply the workflow calls commitAudienceRun() to
// promote the pending snapshot; a rejection calls rejectAudienceRun().

import crypto from 'crypto';
import { get as kvGet, set as kvSet, del as kvDel } from './store';
import { listContacts, listDeals, type ConnectionRef, type HubSpotContact, type LifecycleStage } from './hubspot';

export type AudienceSegment = 'suppression' | 'retarget' | 'seed';
export const AUDIENCE_SEGMENTS: AudienceSegment[] = ['suppression', 'retarget', 'seed'];

export interface AudienceConfig {
  /** Open deal with no modification in this many days counts as "stalled". */
  stalledDays: number;
  /** Contact lifecycle stages eligible for retargeting. */
  warmStages: LifecycleStage[];
  /** Seed only the top-value decile of closed-won contacts (by summed deal value). */
  seedTopValueDecileOnly: boolean;
  /** Auto-approve when BOTH the change % and absolute count stay under these. */
  autoApproveMaxPct: number;
  autoApproveMaxCount: number;
  /** Minimum seed size before a lookalike is eligible. */
  minLookalikeSeed: number;
  /** Require marketing consent for active audiences (retarget/seed). */
  requireConsent: boolean;
}

export const DEFAULT_AUDIENCE_CONFIG: AudienceConfig = {
  stalledDays: 14,
  warmStages: ['marketingqualifiedlead', 'salesqualifiedlead', 'opportunity'],
  seedTopValueDecileOnly: false,
  autoApproveMaxPct: 0.1,
  autoApproveMaxCount: 100,
  minLookalikeSeed: 100,
  requireConsent: true,
};

export interface SegmentDelta {
  segment: AudienceSegment;
  total: number; // current membership size
  adds: string[]; // emailSha256 added since last snapshot
  removes: string[]; // emailSha256 removed since last snapshot
  changePct: number; // (adds + removes) / max(current, previous)
}

export interface AudienceSpec {
  portalId: string;
  runId: string;
  generatedAt: string;
  requireConsent: boolean;
  segments: Record<AudienceSegment, SegmentDelta>;
  lookalike: { seedSize: number; ready: boolean; newlyEligible: boolean };
  approval: { autoApprove: boolean; reasons: string[] };
}

interface PendingSnapshot {
  runId: string;
  generatedAt: string;
  members: Record<AudienceSegment, string[]>;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const snapshotKey = (portalId: string, seg: AudienceSegment) => `pp:aud:snapshot:${portalId}:${seg}`;
const pendingKey = (portalId: string) => `pp:aud:pending:${portalId}`;

// SHA-256 of a normalized email (lowercase + trim) — the form the ad platforms expect.
function hashEmail(email: string | null): string | null {
  if (!email) return null;
  const norm = email.trim().toLowerCase();
  if (!norm) return null;
  return crypto.createHash('sha256').update(norm).digest('hex');
}

export async function computeAudienceSpec(
  ref: ConnectionRef,
  config: Partial<AudienceConfig> = {}
): Promise<AudienceSpec> {
  const cfg = { ...DEFAULT_AUDIENCE_CONFIG, ...config };
  const [contacts, deals] = await Promise.all([listContacts(ref), listDeals(ref)]);

  const closedWon = deals.filter((d) => d.isClosedWon);
  const closedWonContactIds = new Set(closedWon.flatMap((d) => d.associatedContactIds));

  // Seed = closed-won contacts, optionally narrowed to the top-value decile.
  let seedContactIds: Set<string> = closedWonContactIds;
  if (cfg.seedTopValueDecileOnly) {
    const valueByContact = new Map<string, number>();
    for (const d of closedWon) {
      for (const cid of d.associatedContactIds) valueByContact.set(cid, (valueByContact.get(cid) ?? 0) + (d.amount ?? 0));
    }
    const sorted = [...valueByContact.entries()].sort((a, b) => b[1] - a[1]);
    const topN = Math.max(1, Math.ceil(sorted.length * 0.1));
    seedContactIds = new Set(sorted.slice(0, topN).map(([id]) => id));
  }

  // Suppression = customers OR closed-won. Consent NOT required (exclusion is always allowed).
  const suppressionContacts = contacts.filter(
    (c) => c.lifecycleStage === 'customer' || closedWonContactIds.has(c.id)
  );
  const suppressionIds = new Set(suppressionContacts.map((c) => c.id));

  // Stalled = open (not won/lost) deal untouched for stalledDays.
  const cutoff = Date.now() - cfg.stalledDays * DAY_MS;
  const stalledContactIds = new Set(
    deals
      .filter((d) => !d.isClosedWon && !d.isClosedLost && Date.parse(d.lastModifiedAt) < cutoff)
      .flatMap((d) => d.associatedContactIds)
  );

  // Retarget = warm lifecycle + stalled, minus anyone already suppressed.
  const retargetContacts = contacts.filter(
    (c) =>
      c.lifecycleStage != null &&
      cfg.warmStages.includes(c.lifecycleStage) &&
      stalledContactIds.has(c.id) &&
      !suppressionIds.has(c.id)
  );

  const seedContacts = contacts.filter((c) => seedContactIds.has(c.id));

  // Exclude explicit non-marketable contacts from active audiences when consent is required.
  const consentOk = (c: HubSpotContact) => !cfg.requireConsent || c.marketable !== false;
  const toHashes = (list: HubSpotContact[], applyConsent: boolean): Set<string> => {
    const s = new Set<string>();
    for (const c of list) {
      if (applyConsent && !consentOk(c)) continue;
      const h = hashEmail(c.email);
      if (h) s.add(h);
    }
    return s;
  };

  const current: Record<AudienceSegment, Set<string>> = {
    suppression: toHashes(suppressionContacts, false),
    retarget: toHashes(retargetContacts, true),
    seed: toHashes(seedContacts, true),
  };

  // Diff each segment against its last committed snapshot.
  const segments = {} as Record<AudienceSegment, SegmentDelta>;
  let prevSeedSize = 0;
  for (const seg of AUDIENCE_SEGMENTS) {
    const prev = new Set((await kvGet<string[]>(snapshotKey(ref, seg))) ?? []);
    if (seg === 'seed') prevSeedSize = prev.size;
    const cur = current[seg];
    const adds = [...cur].filter((h) => !prev.has(h));
    const removes = [...prev].filter((h) => !cur.has(h));
    const denom = Math.max(cur.size, prev.size, 1);
    segments[seg] = { segment: seg, total: cur.size, adds, removes, changePct: (adds.length + removes.length) / denom };
  }

  const seedSize = current.seed.size;
  const ready = seedSize >= cfg.minLookalikeSeed;
  const newlyEligible = prevSeedSize < cfg.minLookalikeSeed && ready;

  // Approval: hold when any segment moves too much, or a lookalike becomes newly eligible.
  const reasons: string[] = [];
  for (const seg of AUDIENCE_SEGMENTS) {
    const d = segments[seg];
    const changed = d.adds.length + d.removes.length;
    if (d.changePct > cfg.autoApproveMaxPct || changed > cfg.autoApproveMaxCount) {
      reasons.push(`${seg}: ${changed} changes (${Math.round(d.changePct * 100)}%)`);
    }
  }
  if (newlyEligible) reasons.push('lookalike newly eligible');

  const runId = crypto.randomUUID();
  const spec: AudienceSpec = {
    portalId: ref,
    runId,
    generatedAt: new Date().toISOString(),
    requireConsent: cfg.requireConsent,
    segments,
    lookalike: { seedSize, ready, newlyEligible },
    approval: { autoApprove: reasons.length === 0, reasons },
  };

  // Stash the exact membership we just returned, so commit promotes what was applied.
  const pending: PendingSnapshot = {
    runId,
    generatedAt: spec.generatedAt,
    members: {
      suppression: [...current.suppression],
      retarget: [...current.retarget],
      seed: [...current.seed],
    },
  };
  await kvSet(pendingKey(ref), pending);

  return spec;
}

/** Promote the pending snapshot to committed — called after a successful apply. */
export async function commitAudienceRun(
  ref: ConnectionRef,
  runId: string
): Promise<{ ok: boolean; committed: boolean; reason?: string }> {
  const pending = await kvGet<PendingSnapshot>(pendingKey(ref));
  if (!pending) return { ok: false, committed: false, reason: 'no pending run' };
  if (pending.runId !== runId) return { ok: false, committed: false, reason: 'runId mismatch' };
  for (const seg of AUDIENCE_SEGMENTS) await kvSet(snapshotKey(ref, seg), pending.members[seg] ?? []);
  await kvDel(pendingKey(ref));
  return { ok: true, committed: true };
}

/** Discard the pending snapshot — called when approval is rejected. */
export async function rejectAudienceRun(ref: ConnectionRef, runId: string): Promise<{ ok: boolean }> {
  const pending = await kvGet<PendingSnapshot>(pendingKey(ref));
  if (pending && pending.runId === runId) await kvDel(pendingKey(ref));
  return { ok: true };
}
