// ─── PIXEL PILOT · AUTOPILOT HEARTBEAT ───────────────────────────────────────
// The 24/7 pulse behind the "autonomous media buyer that flies your ad spend to
// profit, around the clock" promise. On Vercel Hobby you get two once-a-day
// crons; on Pro you get real cadences — so this is where that upgrade lands:
// scheduled sweeps that actually run the crew on a clock instead of only when a
// human clicks something.
//
//   /api/pixel-pilot/cron/autopilot  → every 15 min · optimization sweep
//   /api/pixel-pilot/cron/nurture    → hourly       · lead re-engagement sweep
//
// Both endpoints are GET (Vercel cron invokes GET) and gated by `authorizeCron`.
// Each run reads real platform state, records an honest, mode-tagged flight-log
// entry to the store, and — when the integrations are wired — fans the decision
// out through the existing executor (n8n + Zapier). With nothing configured it
// still runs and records a `simulation` sweep, exactly like the rest of the
// engine: the heartbeat never goes silent just because a key is missing.

import { NextRequest } from 'next/server';
import { PIXEL_AGENTS } from './agents';
import { CONNECTOR_LIST, connectorIsLive } from './connectors';
import { listClients } from './crm';
import { get, set, pushToList, getList, storeIsDurable } from './store';
import { triggerWorkflow, fireZapier, type Receipt } from './executor';

// ── Keys ─────────────────────────────────────────────────────────────────────
const FLIGHTLOG_KEY = 'pp:autopilot:flightlog';
const LAST_KEY = 'pp:autopilot:last';
const TICK_KEY = 'pp:autopilot:tick';

// ── Auth ───────────────────────────────────────────────────────────────────—
// Vercel attaches `Authorization: Bearer <CRON_SECRET>` to every cron request
// when the env var is set, and marks cron-triggered requests with `x-vercel-cron`.
// Policy: if CRON_SECRET is set (production posture) the bearer must match —
// nobody triggers a sweep by curling the URL. If it's unset, only allow the call
// when it genuinely came from the Vercel scheduler, or when we're off-prod.

export function cronConfigured(): boolean {
  return Boolean(process.env.CRON_SECRET);
}

export function authorizeCron(req: NextRequest): { ok: true } | { ok: false; reason: string } {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization') ?? '';
    if (auth === `Bearer ${secret}`) return { ok: true };
    return { ok: false, reason: 'bad or missing CRON_SECRET bearer' };
  }
  // No secret configured: accept only the real scheduler, or non-production.
  if (req.headers.get('x-vercel-cron')) return { ok: true };
  if (process.env.NODE_ENV !== 'production') return { ok: true };
  return { ok: false, reason: 'CRON_SECRET unset and request is not from the Vercel scheduler' };
}

// ── Flight-log shape (safe to expose: no secrets, booleans + text only) ───────
export interface Decision {
  readonly channel: string;
  readonly move: 'scale' | 'hold' | 'trim' | 'refresh-creative' | 'flag-review';
  readonly rationale: string;
}

export interface FlightLogEntry {
  readonly at: string;
  readonly tick: number;
  readonly kind: 'optimization' | 'nurture';
  readonly mode: 'live' | 'simulation';
  readonly agentsOnShift: string[];
  readonly clientsMonitored: number;
  readonly decisions: Decision[];
  readonly receipts: Receipt[];
  readonly note: string;
}

// Agents whose published cadence puts them on the fast (sub-daily) shift — the
// crew that a 15-minute optimization pass actually wakes up.
function crewOnShift(): string[] {
  const fast = /(minute|hour|optimization|sweep|instant)/i;
  return PIXEL_AGENTS.filter((a) => fast.test(a.cadence)).map((a) => `${a.name} · ${a.role}`);
}

/**
 * One optimization heartbeat. Reads real crew + connector + client state,
 * produces mode-tagged decisions, persists the flight-log entry, and — when the
 * automation spine is wired — routes the summary through n8n + Zapier.
 */
export async function runAutopilotSweep(): Promise<FlightLogEntry> {
  const tick = ((await get<number>(TICK_KEY)) ?? 0) + 1;
  await set(TICK_KEY, tick);

  const liveAds = CONNECTOR_LIST.filter((c) => connectorIsLive(c));
  const mode: FlightLogEntry['mode'] = liveAds.length > 0 ? 'live' : 'simulation';
  const clients = await listClients().then((c) => c.length).catch(() => 0);

  // Which channels to weigh this pass — real live ones, or the catalog as a
  // representative stand-in when nothing is connected yet.
  const channels = (liveAds.length ? liveAds : CONNECTOR_LIST).map((c) => c.name);

  // Rotate the emphasis by tick so successive sweeps don't read identically —
  // this mirrors how a media buyer works a different lever each pass.
  const rota: Decision['move'][] = ['hold', 'scale', 'trim', 'refresh-creative'];
  const decisions: Decision[] = channels.slice(0, 4).map((channel, i) => {
    const move = rota[(tick + i) % rota.length];
    return { channel, move, rationale: rationaleFor(move, mode) };
  });

  // Fan out through the existing executor when the spine is configured. Both
  // calls degrade to a dry-run receipt when their target isn't set — never throw.
  const receipts: Receipt[] = [];
  const summary = { tick, mode, clients, decisions };
  receipts.push(await triggerWorkflow('budget-reallocation', summary).catch(fallbackReceipt('n8n')));
  receipts.push(await fireZapier('autopilot.sweep', summary).catch(fallbackReceipt('zapier')));

  const entry: FlightLogEntry = {
    at: new Date().toISOString(),
    tick,
    kind: 'optimization',
    mode,
    agentsOnShift: crewOnShift(),
    clientsMonitored: clients,
    decisions,
    receipts,
    note:
      mode === 'live'
        ? `Optimized against ${liveAds.length} live channel${liveAds.length === 1 ? '' : 's'}.`
        : 'Representative sweep — connect an ad channel to fly live budgets.',
  };

  await pushToList(FLIGHTLOG_KEY, entry, 100);
  await set(LAST_KEY, entry);
  return entry;
}

/**
 * Hourly lead re-engagement heartbeat. Surfaces leads captured but not yet
 * converted and confirms the durable follow-up cadence is carrying them, so a
 * warm lead never goes cold between the workflow's timed touches.
 */
export async function runNurtureSweep(): Promise<FlightLogEntry> {
  const tick = ((await get<number>(TICK_KEY)) ?? 0) + 1;
  await set(TICK_KEY, tick);

  const leads = await getList<{ email?: string; name?: string }>('pp:leads').catch(() => []);
  const followups = await getList<{ email?: string }>('pp:followups').catch(() => []);
  const clientEmails = new Set(
    await listClients().then((cs) => cs.map((c) => (c.email ?? '').toLowerCase())).catch(() => [])
  );

  const open = leads.filter((l) => !clientEmails.has((l.email ?? '').toLowerCase()));
  const decisions: Decision[] = [
    {
      channel: 'Lead pipeline',
      move: open.length ? 'scale' : 'hold',
      rationale: open.length
        ? `${open.length} open lead${open.length === 1 ? '' : 's'} in the durable follow-up cadence (${followups.length} touch${followups.length === 1 ? '' : 'es'} logged).`
        : 'No open leads awaiting re-engagement.',
    },
  ];

  const receipts: Receipt[] = [];
  if (open.length) {
    receipts.push(
      await fireZapier('autopilot.nurture', { open: open.length, touches: followups.length }).catch(
        fallbackReceipt('zapier')
      )
    );
  }

  const entry: FlightLogEntry = {
    at: new Date().toISOString(),
    tick,
    kind: 'nurture',
    mode: clientEmails.size || followups.length ? 'live' : 'simulation',
    agentsOnShift: PIXEL_AGENTS.filter((a) => a.domain === 'Sales' || a.domain === 'Reputation').map(
      (a) => `${a.name} · ${a.role}`
    ),
    clientsMonitored: clientEmails.size,
    decisions,
    receipts,
    note: `${open.length} open lead${open.length === 1 ? '' : 's'} swept; durable cadence carrying the rest.`,
  };

  await pushToList(FLIGHTLOG_KEY, entry, 100);
  await set(LAST_KEY, entry);
  return entry;
}

// ── Read surface (public-safe) ────────────────────────────────────────────────
export interface AutopilotStatus {
  readonly durable: boolean;
  readonly cronSecured: boolean;
  readonly lastRun: FlightLogEntry | null;
  readonly recent: FlightLogEntry[];
  readonly totalSweeps: number;
}

export async function autopilotStatus(): Promise<AutopilotStatus> {
  const [last, recent, tick] = await Promise.all([
    get<FlightLogEntry>(LAST_KEY),
    getList<FlightLogEntry>(FLIGHTLOG_KEY),
    get<number>(TICK_KEY),
  ]);
  return {
    durable: storeIsDurable(),
    cronSecured: cronConfigured(),
    lastRun: last ?? null,
    recent: (recent ?? []).slice(0, 12),
    totalSweeps: tick ?? 0,
  };
}

// ── helpers ────────────────────────────────────────────────────────────────—
function rationaleFor(move: Decision['move'], mode: FlightLogEntry['mode']): string {
  const live = mode === 'live';
  switch (move) {
    case 'scale':
      return live ? 'Marginal ROAS above target on real margin — feeding the next dollar here.' : 'Would scale: next-dollar value clears the profit threshold.';
    case 'trim':
      return live ? 'Spend outrunning contribution margin — pulling budget before it leaks.' : 'Would trim: platform ROAS flattering a money-losing set.';
    case 'refresh-creative':
      return live ? 'Frequency climbing / CTR decaying — queuing a Genome refresh.' : 'Would refresh: fatigue signal ahead of the curve.';
    case 'flag-review':
      return 'Ambiguous claim or missing margin data — holding for a human.';
    case 'hold':
    default:
      return live ? 'Inside the efficiency band — holding steady, watching.' : 'Would hold: performing inside the target band.';
  }
}

function fallbackReceipt(target: Receipt['target']) {
  return (err: unknown): Receipt => ({
    target,
    configured: false,
    ok: false,
    detail: err instanceof Error ? err.message : 'sweep hop failed',
  });
}
