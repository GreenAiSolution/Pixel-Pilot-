// ─── PIXEL PILOT · AUTONOMOUS RUNNERS ────────────────────────────────────────
// The three backend "runner" agents that fly the account while nobody watches —
// each a small rules engine that reads prior runs from the store, reasons over
// the incoming payload, decides a set of moves, then fires them through the two
// real side-effects in executor.ts (n8n via triggerWorkflow, everything-else via
// the Zapier Catch Hook). Nothing here ever throws on a missing integration: an
// empty .env still yields a believable *simulated* run that lands in Slack.
//
//   • Atlas  — media-buying & profit optimization (budget reallocation)
//   • Iris   — creative & campaign (angle → brief → publish, gated)
//   • Ledger — revenue, attribution & reporting (cross-runner cash digest)
//
// Registry mirrors eagle/agents.ts; run shape is JSON-safe and persisted under
// `pp:runner:<id>` so each agent has memory of what it did last time.

import { triggerWorkflow, fireZapier, type Receipt } from './executor';
import { getList, pushToList, storeIsDurable } from './store';
import { isConnected as qbConnected, companyInfo as qbCompanyInfo } from './quickbooks';

// ── The registry (single source of truth for Mission Control) ────────────────

export interface PixelPilotRunner {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly emoji: string;
  readonly tagline: string;
  readonly specialty: string;
  readonly responsibilities: string[];
  /** Apps / pipes it operates through. */
  readonly integrations: string[];
  /** The numbers it moves. */
  readonly kpis: string[];
  readonly cadence: string;
  /** Claude Code subagent name — how you command it. */
  readonly command: string;
  readonly accent: string;
  /** Its own autonomous endpoint (Vercel Cron hits this). */
  readonly endpoint: string;
}

export const PIXEL_PILOT_RUNNERS: PixelPilotRunner[] = [
  {
    id: 'atlas',
    name: 'Atlas',
    role: 'Media Buyer & Profit Optimization',
    emoji: '🛰️',
    tagline: 'Every next dollar goes where it earns most.',
    specialty:
      'Cross-channel budget reallocation optimized to real profit — trims channels over target CPA and pours spend into the highest-margin winner.',
    responsibilities: [
      'Pull live spend, CPA and profit across Meta, Google & TikTok',
      'Rank channels by marginal return and reallocate to the leader',
      'Trim or pause channels running above their target CPA',
      'Run a discovery sweep when no performance is reported yet',
      'Stage any large budget shift for approval; log every move to Slack',
    ],
    integrations: [
      'Meta Ads',
      'Google Ads',
      'TikTok Ads',
      'Shopify (real margin)',
      'n8n · budget-reallocation',
      'Slack (via Zapier)',
    ],
    kpis: ['Blended net margin ↑', 'CPA vs target', '≤ 25% shift / run', 'Profit-weighted allocation'],
    cadence: 'Hourly (0 * * * *)',
    command: 'pp-atlas',
    accent: '#00D4FF',
    endpoint: '/api/pixel-pilot/runners/atlas',
  },
  {
    id: 'iris',
    name: 'Iris',
    role: 'Creative & Campaign',
    emoji: '🎨',
    tagline: "Today's angle, on-brand, ready to fly.",
    specialty:
      "Picks the day's strategic angle from a non-repeating rotation, briefs the Creative Genome / Higgsfield render, and stages fresh variants — publishing only when the gate is open.",
    responsibilities: [
      "Select today's non-repeating angle (pillar · hook · format · platform)",
      'Brief the Creative Genome refresh and Higgsfield render for it',
      'Iterate a new variant instead of repeating yesterday’s angle',
      'Ship variants to the ad sets only when PP_AUTOPUBLISH is on',
      'Stage everything else for approval and post the plan to Slack',
    ],
    integrations: [
      'Creative Genome',
      'Higgsfield (video)',
      'n8n · creative-refresh',
      'Meta / TikTok ad sets',
      'Slack (via Zapier)',
    ],
    kpis: ['1 fresh unit / run', 'No repeated angle', 'Publish gated', 'On-brand always'],
    cadence: 'Daily 13:00 UTC (0 13 * * *)',
    command: 'pp-iris',
    accent: '#FF2E9A',
    endpoint: '/api/pixel-pilot/runners/iris',
  },
  {
    id: 'ledger',
    name: 'Ledger',
    role: 'Revenue, Attribution & Reporting',
    emoji: '🧾',
    tagline: 'The single source of truth on the money.',
    specialty:
      'Summarizes the last N runs across every runner plus any lead/revenue payload into one cash & performance digest, and proves the QuickBooks pipe is open when a check is due.',
    responsibilities: [
      'Roll up the last N runs across Atlas, Iris and itself',
      'Blend attribution + lead/revenue payload into one picture',
      'Post a daily cash & performance digest to Slack',
      'Run a QuickBooks health check when one is due (>24h)',
      'Flag simulated-only days so nothing reads as live that isn’t',
    ],
    integrations: [
      'Shopify',
      'QuickBooks Online (via Zapier)',
      'Attribution Truth Engine',
      'Slack (via Zapier)',
    ],
    kpis: ['Daily cash digest', 'Attribution truth', 'QB pipe verified', 'Live vs simulated'],
    cadence: 'Daily 23:00 UTC (0 23 * * *)',
    command: 'pp-ledger',
    accent: '#C9A84C',
    endpoint: '/api/pixel-pilot/runners/ledger',
  },
];

export function getRunner(id: string): PixelPilotRunner | undefined {
  return PIXEL_PILOT_RUNNERS.find((r) => r.id === id);
}

// ── Run types ────────────────────────────────────────────────────────────────

export interface RunnerDecision {
  readonly action: string;
  readonly rationale: string;
  readonly target?: 'meta' | 'google' | 'tiktok' | 'n8n' | 'zapier' | 'quickbooks' | 'creative';
  /** True when the move is irreversible/public and held for a human. */
  readonly staged?: boolean;
}

export interface RunnerRun {
  readonly id: string;
  readonly runnerId: string;
  readonly trigger: string;
  readonly startedAt: string;
  readonly mode: 'live' | 'simulated';
  readonly decisions: RunnerDecision[];
  readonly receipts: Receipt[];
  readonly summary: string;
}

export interface RunnerInput {
  readonly trigger: string;
  readonly mode?: 'live' | 'simulated';
  readonly payload?: Record<string, unknown>;
}

/** What a planner sees: the trigger, the payload, and this runner's memory. */
interface PlanContext {
  readonly runner: PixelPilotRunner;
  readonly trigger: string;
  readonly payload: Record<string, unknown>;
  readonly history: RunnerRun[];
  readonly now: Date;
}

const runKey = (id: string) => `pp:runner:${id}`;
const HISTORY_LOOKBACK = 10;

/** Publishing / large irreversible moves are gated behind this flag. */
function autopublishOn(): boolean {
  return process.env.PP_AUTOPUBLISH === 'true';
}

// ── Small typed helpers for reading loose payloads (no `any`) ────────────────

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}
function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}
function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

interface ChannelPerf {
  channel: 'meta' | 'google' | 'tiktok';
  cpa?: number;
  targetCpa?: number;
  profit?: number;
  spend?: number;
}

function readChannels(payload: Record<string, unknown>): ChannelPerf[] {
  return asArray(payload.channels)
    .map((raw): ChannelPerf | null => {
      if (typeof raw !== 'object' || raw === null) return null;
      const r = raw as Record<string, unknown>;
      const channel = asString(r.channel);
      if (channel !== 'meta' && channel !== 'google' && channel !== 'tiktok') return null;
      return {
        channel,
        cpa: asNumber(r.cpa),
        targetCpa: asNumber(r.targetCpa),
        profit: asNumber(r.profit),
        spend: asNumber(r.spend),
      };
    })
    .filter((c): c is ChannelPerf => c !== null);
}

// ─── PLANNERS — the "think on their own" core, one per runner ─────────────────

/** Atlas: reallocate budget to profit; trim over-target channels; sweep if blind. */
function planAtlas(ctx: PlanContext): RunnerDecision[] {
  const channels = readChannels(ctx.payload);
  const decisions: RunnerDecision[] = [];

  if (channels.length === 0) {
    // Nothing reported — decide how hard to look based on memory.
    const lastWasBlind = ctx.history[0]?.decisions.some((d) => d.action.startsWith('Discovery sweep'));
    decisions.push({
      action: lastWasBlind ? 'Discovery sweep (2nd pass — escalate)' : 'Discovery sweep',
      rationale: lastWasBlind
        ? 'Second consecutive run with no channel data — pull a full spend + delivery snapshot across all channels.'
        : 'No channel performance in the payload — pull live spend, CPA and profit before committing budget.',
      target: 'n8n',
    });
    return decisions;
  }

  // Rank the healthy channels by real profit to find where the next dollar earns most.
  const ranked = [...channels].sort((a, b) => (b.profit ?? -Infinity) - (a.profit ?? -Infinity));
  const leader = ranked[0];

  // Trim any channel running above its target CPA.
  const overTarget = channels.filter(
    (c) => c.cpa !== undefined && c.targetCpa !== undefined && c.cpa > c.targetCpa
  );
  for (const c of overTarget) {
    const over = Math.round(((c.cpa! - c.targetCpa!) / c.targetCpa!) * 100);
    const bigMove = over >= 25; // beyond the ≤25% per-run guardrail → hold for a human
    decisions.push({
      action: `Trim ${c.channel} budget`,
      rationale: `${c.channel} CPA $${c.cpa} is ${over}% over its $${c.targetCpa} target — pull spend back toward efficiency.`,
      target: c.channel,
      staged: bigMove && !autopublishOn(),
    });
  }

  // Shift the freed budget toward the highest-profit leader.
  if (leader && leader.profit !== undefined && (overTarget.length > 0 || channels.length > 1)) {
    const isLeaderOver = overTarget.some((c) => c.channel === leader.channel);
    if (!isLeaderOver) {
      // A broad rebalance (multiple channels trimmed) is a bigger, staged move.
      const broadRebalance = overTarget.length > 1;
      decisions.push({
        action: `Shift budget to ${leader.channel}`,
        rationale: `${leader.channel} is the highest-profit channel ($${leader.profit}) — route the next dollar here (≤25% shift / run).`,
        target: leader.channel,
        staged: broadRebalance && !autopublishOn(),
      });
    }
  }

  // All healthy → scale the winner instead of just holding.
  if (overTarget.length === 0 && leader?.profit !== undefined) {
    decisions.push({
      action: `Scale ${leader.channel} winner`,
      rationale: `Every channel is at or under target CPA — lean into ${leader.channel}, the profit leader, within the per-run cap.`,
      target: leader.channel,
    });
  }

  return decisions;
}

// A compact, non-repeating creative rotation — mirrors scripts/marketing-angle.mjs
// (angleFor) so Iris speaks the same strategic language without importing an .mjs.
const CREATIVE_ANGLES: { pillar: string; hook: string; format: string; platform: string }[] = [
  { pillar: 'Autonomous Media Buyer', hook: "You don't get a login. You get a media buyer.", format: 'X thread', platform: 'X' },
  { pillar: 'Profit, not ROAS', hook: 'Meta will never optimize against its own revenue. We do.', format: 'LinkedIn post', platform: 'LinkedIn' },
  { pillar: 'Creative Genome', hook: 'Winning ads, decoded into genes and recombined.', format: 'Short-form reel', platform: 'TikTok/Reels' },
  { pillar: 'Attribution Truth', hook: 'Finally know what actually drove the sale, post-iOS.', format: 'X thread', platform: 'X' },
  { pillar: 'Zero-to-Live in <60min', hook: 'Point it at a URL. Walk away. Come back to live ads.', format: 'Demo video', platform: 'LinkedIn' },
  { pillar: 'Cross-Channel Conductor', hook: 'One brain across Meta, Google & TikTok.', format: 'Carousel', platform: 'LinkedIn' },
  { pillar: 'Impression-Level Creative', hook: 'A different ad for every single viewer.', format: 'Higgsfield reel', platform: 'TikTok/Reels' },
];

function angleForDay(date: Date): (typeof CREATIVE_ANGLES)[number] & { slot: number; of: number } {
  const days = Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86400000);
  const idx = ((days % CREATIVE_ANGLES.length) + CREATIVE_ANGLES.length) % CREATIVE_ANGLES.length;
  return { ...CREATIVE_ANGLES[idx], slot: idx + 1, of: CREATIVE_ANGLES.length };
}

/** Iris: pick today's angle, brief creative, and decide whether to publish. */
function planIris(ctx: PlanContext): RunnerDecision[] {
  const angle = angleForDay(ctx.now);
  const decisions: RunnerDecision[] = [];

  // Did we already brief this exact angle recently? If so, iterate a variant.
  const briefedToday = ctx.history[0]?.decisions.some((d) => d.action.includes(angle.pillar));
  decisions.push({
    action: briefedToday
      ? `Iterate a fresh variant for "${angle.pillar}"`
      : `Brief creative for "${angle.pillar}"`,
    rationale: briefedToday
      ? `Yesterday's run already used ${angle.pillar} — recombine winning genes into a new variant instead of repeating.`
      : `Today's slot ${angle.slot}/${angle.of}: ${angle.pillar} — hook "${angle.hook}" as a ${angle.format} for ${angle.platform}.`,
    target: 'creative',
  });

  // Publishing is gated behind PP_AUTOPUBLISH.
  const canPublish = autopublishOn();
  decisions.push({
    action: canPublish ? `Publish ${angle.format} to ${angle.platform} ad sets` : `Stage ${angle.format} for approval`,
    rationale: canPublish
      ? 'PP_AUTOPUBLISH is on — ship the rendered variant to the live ad sets.'
      : 'PP_AUTOPUBLISH is off — hold the public post for a human to approve.',
    target: canPublish ? 'meta' : 'zapier',
    staged: !canPublish,
  });

  return decisions;
}

/** Ledger: roll up cross-runner runs + lead payload; digest; QB check when due. */
async function planLedger(ctx: PlanContext): Promise<RunnerDecision[]> {
  const decisions: RunnerDecision[] = [];

  // Pull the recent runs of the *other* runners to build one picture.
  const others = PIXEL_PILOT_RUNNERS.filter((r) => r.id !== ctx.runner.id);
  const crossRuns: RunnerRun[] = [];
  for (const r of others) {
    const runs = await getList<RunnerRun>(runKey(r.id));
    crossRuns.push(...runs.slice(0, HISTORY_LOOKBACK));
  }
  const totalDecisions = crossRuns.reduce((n, run) => n + run.decisions.length, 0);
  const liveRuns = crossRuns.filter((run) => run.mode === 'live').length;

  // Any lead/revenue signal in the payload sharpens the digest.
  const leads = asArray(ctx.payload.leads).length;
  const revenue = asNumber(ctx.payload.revenue);

  decisions.push({
    action: 'Post cash & performance digest',
    rationale:
      `Rolled up ${crossRuns.length} run(s) across ${others.length} runner(s) (${totalDecisions} decision(s), ${liveRuns} live)` +
      `${leads ? `, ${leads} new lead(s)` : ''}${revenue !== undefined ? `, $${revenue} revenue` : ''} — send the daily digest to Slack.`,
    target: 'zapier',
  });

  // QuickBooks check is due if we haven't verified it in the last 24h.
  const lastQbAt = ctx.history.find((run) =>
    run.decisions.some((d) => d.target === 'quickbooks')
  )?.startedAt;
  const dueForQb =
    !lastQbAt || ctx.now.getTime() - new Date(lastQbAt).getTime() > 24 * 60 * 60 * 1000;
  if (dueForQb) {
    decisions.push({
      action: 'Verify QuickBooks pipe',
      rationale: lastQbAt
        ? `Last QuickBooks check was ${new Date(lastQbAt).toISOString()} — prove the accounting connection is still live.`
        : 'No QuickBooks check on record — confirm the accounting pipe is open.',
      target: 'quickbooks',
    });
  }

  return decisions;
}

/** The reasoning core — routes to the runner-specific planner. */
export async function plan(runner: PixelPilotRunner, ctx: PlanContext): Promise<RunnerDecision[]> {
  switch (runner.id) {
    case 'atlas':
      return planAtlas(ctx);
    case 'iris':
      return planIris(ctx);
    case 'ledger':
      return planLedger(ctx);
    default:
      return [];
  }
}

// ── Side-effect wiring (graceful, per decision) ──────────────────────────────

/** The primary n8n workflow each runner drives (undefined = zapier/QB only). */
const RUNNER_WORKFLOW: Record<string, string | undefined> = {
  atlas: 'budget-reallocation',
  iris: 'creative-refresh',
  ledger: undefined,
};

/** Prove the QuickBooks connection is live — degrades gracefully when it isn't. */
async function quickbooksReceipt(): Promise<Receipt> {
  try {
    if (await qbConnected()) {
      const company = await qbCompanyInfo();
      return {
        target: 'quickbooks',
        configured: true,
        ok: Boolean(company),
        detail: company ? `Connected to ${company.name}` : 'No company on token',
      };
    }
    return {
      target: 'quickbooks',
      configured: false,
      ok: false,
      detail: 'QuickBooks not connected — connect it at /api/pixel-pilot/connectors/quickbooks',
    };
  } catch (err) {
    return {
      target: 'quickbooks',
      configured: true,
      ok: false,
      detail: err instanceof Error ? err.message : 'QuickBooks check failed',
    };
  }
}

/** Execute one decision through the right graceful side-effect. Never throws. */
async function executeDecision(runnerId: string, d: RunnerDecision): Promise<Receipt> {
  // Staged moves are irreversible/public — record the intent, fire nothing live.
  if (d.staged) {
    return { target: 'zapier', configured: false, ok: true, mode: 'dry-run', detail: `Staged: ${d.action}` };
  }
  try {
    switch (d.target) {
      case 'quickbooks':
        return await quickbooksReceipt();
      case 'n8n':
      case 'creative':
      case 'meta':
      case 'google':
      case 'tiktok': {
        const wf = RUNNER_WORKFLOW[runnerId];
        if (wf) return await triggerWorkflow(wf, { runner: runnerId, decision: d });
        return await fireZapier('runner.action', { runner: runnerId, action: d.action, target: d.target ?? 'n8n' });
      }
      case 'zapier':
      default:
        return await fireZapier('runner.action', { runner: runnerId, action: d.action, rationale: d.rationale });
    }
  } catch (err) {
    return {
      target: d.target === 'n8n' ? 'n8n' : 'zapier',
      configured: true,
      ok: false,
      detail: err instanceof Error ? err.message : 'decision execution failed',
    };
  }
}

function buildSummary(runner: PixelPilotRunner, decisions: RunnerDecision[], mode: 'live' | 'simulated'): string {
  if (decisions.length === 0) {
    return `${runner.name} held — no actionable signal this run (${mode}).`;
  }
  const staged = decisions.filter((d) => d.staged).length;
  const acted = decisions.length - staged;
  const lead = decisions.map((d) => d.action).slice(0, 3).join('; ');
  const tail = staged ? ` · ${staged} staged for approval` : '';
  return `${runner.name} ${mode === 'live' ? 'executed' : 'simulated'} ${acted} move(s)${tail}: ${lead}.`;
}

// ── The public entrypoint ────────────────────────────────────────────────────

/** Run a runner autonomously: plan → execute → digest → persist. Never throws. */
export async function runRunner(runnerId: string, input: RunnerInput): Promise<RunnerRun> {
  const runner = getRunner(runnerId);
  if (!runner) {
    throw new Error(`Unknown runner "${runnerId}"`);
  }

  const now = new Date();
  const history = (await getList<RunnerRun>(runKey(runner.id))).slice(0, HISTORY_LOOKBACK);
  const ctx: PlanContext = {
    runner,
    trigger: input.trigger,
    payload: input.payload ?? {},
    history,
    now,
  };

  const decisions = await plan(runner, ctx);

  // Execute each decision through its graceful side-effect.
  const receipts: Receipt[] = [];
  for (const d of decisions) {
    receipts.push(await executeDecision(runner.id, d));
  }

  const mode: 'live' | 'simulated' = receipts.some((r) => r.configured) ? 'live' : 'simulated';
  const summary = buildSummary(runner, decisions, mode);

  // Always fan a compact digest out to #pixel-pilot (Slack via Zapier).
  receipts.push(
    await fireZapier('runner.report', {
      runner: runner.id,
      name: runner.name,
      trigger: input.trigger,
      mode,
      summary,
      digest: decisions.map((d) => ({ action: d.action, target: d.target ?? 'n8n', staged: Boolean(d.staged) })),
    })
  );

  const run: RunnerRun = {
    id: `run_${runner.id}_${now.getTime().toString(36)}`,
    runnerId: runner.id,
    trigger: input.trigger,
    startedAt: now.toISOString(),
    mode,
    decisions,
    receipts,
    summary,
  };

  await pushToList<RunnerRun>(runKey(runner.id), run);
  return run;
}

/** Recent runs for one runner (newest first). */
export async function recentRuns(runnerId: string, cap = HISTORY_LOOKBACK): Promise<RunnerRun[]> {
  return (await getList<RunnerRun>(runKey(runnerId))).slice(0, cap);
}

/** Recent runs across every runner, interleaved newest-first. */
export async function recentRunsAll(cap = 6): Promise<RunnerRun[]> {
  const all: RunnerRun[] = [];
  for (const r of PIXEL_PILOT_RUNNERS) {
    all.push(...(await getList<RunnerRun>(runKey(r.id))));
  }
  return all.sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, cap);
}

/** True when runs are persisted durably (KV) vs the in-memory dev fallback. */
export function runnersDurable(): boolean {
  return storeIsDurable();
}
