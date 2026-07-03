// ─── PIXEL PILOT · AUTOMATION DESIGNER ───────────────────────────────────────
// The brain behind the post-sign-up Automator. Pure data + wiring, no React:
// the option catalogs a client picks from, a per-service default, and a builder
// that composes a live workflow graph from whatever the client configures. Edit
// a knob → the graph recomposes. The surface (app/automator) just renders this.

import { CONNECTORS, type ConnectorId } from './connectors';
import { getService, type Service, type ServiceCategory } from './services';
import { WORKFLOWS, type Workflow } from './workflows';

// ── Config the client builds ────────────────────────────────────────────────

export type TriggerKind = 'schedule' | 'event' | 'webhook';
export type Objective = 'profit' | 'roas' | 'cpa' | 'volume';

export interface AutomationConfig {
  serviceId: string;
  trigger: TriggerKind;
  cadence: string;
  channels: ConnectorId[];
  objective: Objective;
  /** 0–100: how much the buyer may do without a human. */
  autonomy: number;
  /** 0–100: how hard it pushes winners / cuts losers. */
  aggressiveness: number;
  /** Max % of a budget it may move in a single run. */
  maxBudgetShiftPct: number;
  approvalGate: boolean;
  autoApply: boolean;
  notifySlack: boolean;
  notifyEmail: boolean;
}

// ── Option catalogs (the UI reads these) ─────────────────────────────────────

export const TRIGGERS: { id: TriggerKind; name: string; note: string }[] = [
  { id: 'schedule', name: 'On a schedule', note: 'Runs on a fixed cadence, 24/7' },
  { id: 'event', name: 'On a signal', note: 'Fires the moment something changes' },
  { id: 'webhook', name: 'On demand', note: 'Kicked off by a webhook or click' },
];

export const CADENCES = ['Every 5 min', 'Every 15 min', 'Hourly', 'Every 6 hours', 'Daily'];

export const OBJECTIVES: { id: Objective; name: string; note: string; accent: string }[] = [
  { id: 'profit', name: 'Net profit', note: 'Bid to real margin — COGS, returns & LTV', accent: '#95BF47' },
  { id: 'roas', name: 'ROAS', note: 'Return on ad spend', accent: '#00D4FF' },
  { id: 'cpa', name: 'Cost / action', note: 'Cheapest qualified conversions', accent: '#6C63FF' },
  { id: 'volume', name: 'Max volume', note: 'Scale spend at a target efficiency', accent: '#FF2E9A' },
];

/** How each service family thinks + acts — makes the graph service-specific. */
const CATEGORY_PLAN: Record<ServiceCategory, { logic: string; action: string; creative?: boolean }> = {
  Autonomy: { logic: 'Decide the next move', action: 'Execute in-platform' },
  Economics: { logic: 'Profit model · COGS × LTV', action: 'Rebid to margin' },
  Orchestration: { logic: 'Rank marginal ROAS', action: 'Shift budget to winners' },
  Creative: { logic: 'Recombine winning genes', action: 'Publish fresh variants', creative: true },
  Intelligence: { logic: 'Score + predict', action: 'Feed the optimizer' },
  Trust: { logic: 'Screen against policy', action: 'Approve, rewrite or block' },
};

// ── Per-service default, seeded from the real n8n workflow when one exists ────

export function workflowForService(serviceId: string): Workflow | undefined {
  return WORKFLOWS.find((w) => w.serviceId === serviceId);
}

export function defaultConfigFor(serviceId: string): AutomationConfig {
  const wf = workflowForService(serviceId);
  const service = getService(serviceId);
  return {
    serviceId,
    trigger: wf?.trigger ?? 'schedule',
    cadence: wf?.cadence && CADENCES.includes(wf.cadence) ? wf.cadence : 'Every 15 min',
    channels: ['meta_ads', 'google_ads', 'tiktok_ads'],
    objective: service?.category === 'Economics' ? 'profit' : 'profit',
    autonomy: 70,
    aggressiveness: 55,
    maxBudgetShiftPct: 25,
    approvalGate: false,
    autoApply: true,
    notifySlack: true,
    notifyEmail: false,
  };
}

// ── The live graph ───────────────────────────────────────────────────────────

export type NodeKind =
  | 'trigger'
  | 'source'
  | 'merge'
  | 'creative'
  | 'logic'
  | 'guard'
  | 'action'
  | 'notify';

export interface AutoNode {
  readonly id: string;
  readonly label: string;
  readonly kind: NodeKind;
  readonly note: string;
  /** Source nodes carry their connector brand hue. */
  readonly hue?: string;
}

export interface AutoGraph {
  /** Ordered stages, top → bottom. A stage with >1 node runs in parallel. */
  readonly stages: AutoNode[][];
  readonly summary: string;
  readonly nodeCount: number;
}

function triggerNote(t: TriggerKind): string {
  return t === 'schedule' ? 'Cron cadence' : t === 'event' ? 'Fatigue / anomaly signal' : 'Webhook kickoff';
}

/** Compose the workflow from the config. Every knob change reshapes this. */
export function buildAutomationGraph(config: AutomationConfig): AutoGraph {
  const service = getService(config.serviceId);
  if (!service) return { stages: [], summary: '', nodeCount: 0 };
  const plan = CATEGORY_PLAN[service.category];
  const stages: AutoNode[][] = [];

  // 1 · Trigger
  const trigLabel =
    config.trigger === 'schedule' ? config.cadence : config.trigger === 'event' ? 'On signal' : 'On demand';
  stages.push([{ id: 'trigger', label: trigLabel, kind: 'trigger', note: triggerNote(config.trigger) }]);

  // 2 · Sources — one pull per connected channel (parallel)
  const chans = config.channels.map((id) => CONNECTORS[id]).filter(Boolean);
  const sources: AutoNode[] = chans.length
    ? chans.map((c) => ({
        id: `src_${c.id}`,
        label: `Pull ${c.name}`,
        kind: 'source' as NodeKind,
        note: 'Live spend + delivery',
        hue: c.hue,
      }))
    : [{ id: 'src_none', label: 'Pull account data', kind: 'source', note: 'Connect a channel to feed this' }];
  stages.push(sources);

  // 3 · Merge — profit-aware when optimizing to profit or Shopify is wired in
  const profitAware = config.objective === 'profit' || config.channels.includes('shopify');
  stages.push([
    {
      id: 'merge',
      label: profitAware ? 'Join + Shopify profit' : 'Merge signals',
      kind: 'merge',
      note: profitAware ? 'Attach real margin' : 'Unify the picture',
    },
  ]);

  // 4 · Creative forge (creative services only)
  if (plan.creative) {
    stages.push([{ id: 'creative', label: 'Higgsfield render', kind: 'creative', note: 'Forge fresh variants' }]);
  }

  // 5 · The decision
  const objective = OBJECTIVES.find((o) => o.id === config.objective)!;
  stages.push([
    {
      id: 'logic',
      label: plan.logic,
      kind: 'logic',
      note: `Optimize to ${objective.name.toLowerCase()} · ${config.aggressiveness}% aggressive`,
    },
  ]);

  // 6 · Guardrail (optional)
  if (config.approvalGate) {
    stages.push([
      {
        id: 'guard',
        label: `Approval gate · ${config.autonomy}% auto`,
        kind: 'guard',
        note: 'Hold the big moves for a human',
      },
    ]);
  }

  // 7 · Act
  stages.push([
    {
      id: 'action',
      label: config.autoApply ? plan.action : `Draft: ${plan.action}`,
      kind: 'action',
      note: config.autoApply ? `≤ ${config.maxBudgetShiftPct}% shift / run` : 'Queued for your review',
    },
  ]);

  // 8 · Notify (optional, parallel)
  const notifiers: AutoNode[] = [];
  if (config.notifySlack) notifiers.push({ id: 'slack', label: 'Post to Slack', kind: 'notify', note: 'War-room log' });
  if (config.notifyEmail) notifiers.push({ id: 'email', label: 'Email digest', kind: 'notify', note: 'Daily recap' });
  if (notifiers.length) stages.push(notifiers);

  const nodeCount = stages.reduce((n, s) => n + s.length, 0);
  return { stages, summary: summarize(config, service), nodeCount };
}

function summarize(config: AutomationConfig, service: Service): string {
  const chans = config.channels.length;
  const obj = OBJECTIVES.find((o) => o.id === config.objective)!.name.toLowerCase();
  const when =
    config.trigger === 'schedule' ? config.cadence.toLowerCase() : config.trigger === 'event' ? 'on every signal' : 'on demand';
  const hands = config.approvalGate
    ? `holding moves over ${100 - config.autonomy}% risk for approval`
    : config.autoApply
      ? 'fully hands-off'
      : 'drafting for your review';
  return `${service.name} runs ${when} across ${chans} channel${chans === 1 ? '' : 's'}, optimizing to ${obj}, ${hands}.`;
}

/** A shippable manifest for the "Deploy" step — the automation, serialized. */
export function toManifest(config: AutomationConfig) {
  const service = getService(config.serviceId);
  const wf = workflowForService(config.serviceId);
  return {
    id: `auto_${config.serviceId}_${Math.random().toString(36).slice(2, 8)}`,
    service: service?.name ?? config.serviceId,
    trigger: config.trigger,
    cadence: config.trigger === 'schedule' ? config.cadence : '—',
    channels: config.channels,
    objective: config.objective,
    autonomy: config.autonomy,
    aggressiveness: config.aggressiveness,
    maxBudgetShiftPct: config.maxBudgetShiftPct,
    approvalGate: config.approvalGate,
    autoApply: config.autoApply,
    notify: [config.notifySlack && 'slack', config.notifyEmail && 'email'].filter(Boolean),
    webhookPath: wf?.webhookPath ?? null,
    workflowId: wf?.id ?? null,
  };
}
