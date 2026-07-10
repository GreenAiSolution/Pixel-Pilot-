// ─── PIXEL PILOT · ORBITAL CRM ───────────────────────────────────────────────
// The client command core. Every client Pixel Pilot flies for is a CrmClient —
// a typed record that knows its pipeline stage, the integrations it runs on,
// the agent squad assigned to it, and a capped mission timeline. Persistence
// rides the same KV store as the rest of the engine (durable when KV env vars
// are present, in-memory in dev), and the integration registry is wired to the
// project's real capability surface: the four OAuth ad connectors, HubSpot,
// QuickBooks, Higgsfield, Claude, and the n8n/Zapier automation spine — plus a
// relay tier so a client can be tagged with *any* tool they use (Slack, Stripe,
// Klaviyo, GA4, custom webhooks) and reached through the Zapier fan-out.

import { CONNECTORS, connectorIsLive } from './connectors';
import { hubspotConfigured } from './hubspot';
import { quickbooksConfigured } from './quickbooks';
import { PIXEL_AGENTS } from './agents';
import { get, set, storeIsDurable } from './store';
import {
  PIPELINE,
  isStageId,
  type StageId,
  type ClientSource,
  type ClientIntegration,
  type CrmEvent,
  type CrmClient,
  type CrmSummary,
} from './crm-shared';

// Pure data + types (pipeline, sources, record shapes) live in ./crm-shared so
// browser components can import them without dragging in node crypto / env.
export * from './crm-shared';

// ─── INTEGRATION REGISTRY ────────────────────────────────────────────────────
// Everything a client's business might run on, mapped to how Pixel Pilot
// actually reaches it. Three wiring tiers:
//   'oauth'  → first-class OAuth pipe in this codebase (connectors.ts et al.)
//   'engine' → an internal engine capability keyed by env credentials
//   'relay'  → reached through the Zapier fan-out / n8n spine, so ANY app a
//              client uses can be attached even without first-party code.

export type IntegrationWiring = 'oauth' | 'engine' | 'relay';
export type IntegrationStatus = 'wired' | 'relay' | 'dormant';

export interface IntegrationDef {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly hue: string;
  readonly wiring: IntegrationWiring;
  /** What Pixel Pilot does with this pipe once a client attaches it. */
  readonly powers: string;
  /** Where in the project this integration is actually wired. */
  readonly wiredVia: string;
}

const OAUTH_INTEGRATIONS: IntegrationDef[] = Object.values(CONNECTORS).map((c) => ({
  id: c.id,
  name: c.name,
  category: c.category,
  hue: c.hue,
  wiring: 'oauth' as const,
  powers: c.powers[0],
  wiredVia: `/api/pixel-pilot/connectors/${c.id}`,
}));

const ENGINE_INTEGRATIONS: IntegrationDef[] = [
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'CRM Sync',
    hue: '#FF7A59',
    wiring: 'engine',
    powers: 'Two-way contact + deal sync; pipeline-profit telemetry feeds the Ledger agent',
    wiredVia: 'pixel-pilot/hubspot · /api/pixel-pilot/connectors/hubspot',
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    category: 'Finance',
    hue: '#2CA01C',
    wiring: 'engine',
    powers: 'Client auto-created as a QuickBooks customer; real margin flows into bid decisions',
    wiredVia: 'pixel-pilot/quickbooks · /api/pixel-pilot/connectors/quickbooks',
  },
  {
    id: 'higgsfield',
    name: 'Higgsfield',
    category: 'Creative',
    hue: '#B84CFF',
    wiring: 'engine',
    powers: 'Creative Forge renders on-brand video/image variants for this client',
    wiredVia: 'pixel-pilot/higgsfield · /api/pixel-pilot/higgsfield',
  },
  {
    id: 'n8n',
    name: 'n8n Spine',
    category: 'Automation',
    hue: '#EA4B71',
    wiring: 'engine',
    powers: 'Client lifecycle events trigger n8n workflows (onboarding, audience sync, pipeline truth)',
    wiredVia: 'pixel-pilot/executor · n8n/*.json',
  },
  {
    id: 'zapier',
    name: 'Zapier Relay',
    category: 'Automation',
    hue: '#FF4F00',
    wiring: 'engine',
    powers: 'Fans every CRM event out to 9,000+ apps — the bridge to whatever a client runs',
    wiredVia: 'pixel-pilot/executor · /api/pixel-pilot/zapier',
  },
];

// Relay tier — attachable to any client; events reach these through Zapier/n8n.
const RELAY_INTEGRATIONS: IntegrationDef[] = [
  { id: 'stripe', name: 'Stripe', category: 'Payments', hue: '#635BFF', wiring: 'relay', powers: 'Revenue + subscription truth relayed into profit telemetry', wiredVia: 'Zapier relay' },
  { id: 'slack', name: 'Slack', category: 'Comms', hue: '#4A154B', wiring: 'relay', powers: 'Mission reports and alerts posted to the client’s war room', wiredVia: 'Zapier relay' },
  { id: 'klaviyo', name: 'Klaviyo', category: 'Email/SMS', hue: '#0AB196', wiring: 'relay', powers: 'Lifecycle audiences pushed to email + SMS flows', wiredVia: 'Zapier relay · n8n audience-sync' },
  { id: 'ga4', name: 'Google Analytics 4', category: 'Analytics', hue: '#F9AB00', wiring: 'relay', powers: 'Site behavior folded into the attribution picture', wiredVia: 'Zapier relay' },
  { id: 'gohighlevel', name: 'GoHighLevel', category: 'CRM Sync', hue: '#1BC98E', wiring: 'relay', powers: 'Agency-side pipeline mirrored for white-label clients', wiredVia: 'Zapier relay' },
  { id: 'webhook', name: 'Custom Webhook', category: 'Anything Else', hue: '#8890A0', wiring: 'relay', powers: 'Any tool with a URL — CRM events POST to the client’s own endpoint', wiredVia: 'Zapier relay · executor' },
];

export const INTEGRATION_REGISTRY: IntegrationDef[] = [
  ...OAUTH_INTEGRATIONS,
  ...ENGINE_INTEGRATIONS,
  ...RELAY_INTEGRATIONS,
];

export function isIntegrationId(v: string): boolean {
  return INTEGRATION_REGISTRY.some((i) => i.id === v);
}

/**
 * Resolve the live status of every integration from the project's real config:
 * OAuth connectors check their env credential pairs, engine pipes check their
 * own `*Configured()` guards, relay pipes are live whenever the Zapier hook is.
 */
export function integrationStatus(def: IntegrationDef): IntegrationStatus {
  switch (def.wiring) {
    case 'oauth': {
      const c = CONNECTORS[def.id as keyof typeof CONNECTORS];
      return c && connectorIsLive(c) ? 'wired' : 'dormant';
    }
    case 'engine': {
      if (def.id === 'hubspot') return hubspotConfigured() ? 'wired' : 'dormant';
      if (def.id === 'quickbooks') return quickbooksConfigured() ? 'wired' : 'dormant';
      if (def.id === 'higgsfield') return process.env.HIGGSFIELD_API_KEY ? 'wired' : 'dormant';
      if (def.id === 'n8n') return process.env.N8N_BASE_URL ? 'wired' : 'dormant';
      if (def.id === 'zapier') return process.env.ZAPIER_HOOK_URL ? 'wired' : 'dormant';
      return 'dormant';
    }
    case 'relay':
      return process.env.ZAPIER_HOOK_URL ? 'relay' : 'dormant';
  }
}

// ─── CLIENT MODEL ────────────────────────────────────────────────────────────

const ROSTER_KEY = 'pp:crm:clients';
const ROSTER_CAP = 500;
const TIMELINE_CAP = 50;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Default squad for a fresh client — strategy, buying, economics, ops. */
const DEFAULT_SQUAD = ['growth-strategist', 'media-buyer', 'profit-analyst', 'ops-commander'];

export function validAgentIds(ids: string[]): string[] {
  const known = new Set(PIXEL_AGENTS.map((a) => a.id));
  return ids.filter((id) => known.has(id));
}

/**
 * Deterministic health score: stage depth + integration coverage + telemetry
 * freshness + economics. Recomputed on every mutation so the deck never shows
 * a stale number.
 */
export function computeHealth(c: CrmClient): number {
  const stage = PIPELINE.find((s) => s.id === c.stage);
  if (!stage || stage.terminal) return 0;

  let score = 20 + stage.weight; // 20 base + up to 40 for stage depth

  // Integration coverage — each linked pipe is signal, capped at 20.
  score += Math.min(20, c.integrations.length * 5);

  // Freshness — recent timeline activity keeps the pulse up (max 12, decays over 2 weeks).
  const last = c.timeline[0]?.at ?? c.updatedAt;
  const staleDays = Math.max(0, (Date.now() - Date.parse(last)) / DAY_MS);
  score += Math.max(0, 12 - staleDays);

  // Economics — a live retainer is proof of life.
  if ((c.retainer ?? 0) > 0) score += 8;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function pushEvent(c: CrmClient, kind: CrmEvent['kind'], summary: string): void {
  c.timeline = [{ at: new Date().toISOString(), kind, summary }, ...c.timeline].slice(0, TIMELINE_CAP);
}

// ─── PERSISTENCE ─────────────────────────────────────────────────────────────
// The whole roster lives under one KV key — simple, atomic enough for a
// single-operator deck, and durable whenever KV is configured.

export async function listClients(): Promise<CrmClient[]> {
  return (await get<CrmClient[]>(ROSTER_KEY)) ?? [];
}

export async function getClient(id: string): Promise<CrmClient | null> {
  return (await listClients()).find((c) => c.id === id) ?? null;
}

async function saveRoster(roster: CrmClient[]): Promise<void> {
  await set(ROSTER_KEY, roster.slice(0, ROSTER_CAP));
}

export interface NewClientInput {
  name: string;
  company: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  monthlySpend?: number;
  retainer?: number;
  stage?: StageId;
  source?: ClientSource;
  integrations?: { id: string; externalRef?: string }[];
  squad?: string[];
  tags?: string[];
  notes?: string;
}

export async function createClient(input: NewClientInput): Promise<CrmClient> {
  const now = new Date().toISOString();
  const client: CrmClient = {
    id: `cli_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name: input.name,
    company: input.company,
    email: input.email,
    phone: input.phone,
    website: input.website,
    industry: input.industry,
    monthlySpend: input.monthlySpend,
    retainer: input.retainer,
    stage: input.stage ?? 'radar',
    source: input.source ?? 'manual',
    integrations: (input.integrations ?? [])
      .filter((i) => isIntegrationId(i.id))
      .map((i) => ({ id: i.id, externalRef: i.externalRef, linkedAt: now })),
    squad: input.squad?.length ? validAgentIds(input.squad) : DEFAULT_SQUAD,
    tags: input.tags ?? [],
    notes: input.notes,
    health: 0,
    timeline: [],
    createdAt: now,
    updatedAt: now,
  };
  pushEvent(client, 'created', `${client.company} acquired via ${client.source} — entered the deck at ${client.stage}`);
  for (const i of client.integrations) {
    const def = INTEGRATION_REGISTRY.find((d) => d.id === i.id);
    pushEvent(client, 'integration', `${def?.name ?? i.id} linked${i.externalRef ? ` (${i.externalRef})` : ''}`);
  }
  client.health = computeHealth(client);

  const roster = await listClients();
  await saveRoster([client, ...roster]);
  return client;
}

export interface ClientPatch {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  monthlySpend?: number;
  retainer?: number;
  stage?: StageId;
  tags?: string[];
  notes?: string;
  squad?: string[];
  /** Attach an integration. */
  linkIntegration?: { id: string; externalRef?: string };
  /** Detach an integration by id. */
  unlinkIntegration?: string;
  /** Append a freeform timeline event. */
  logEvent?: { kind?: CrmEvent['kind']; summary: string };
}

export async function updateClient(id: string, patch: ClientPatch): Promise<CrmClient | null> {
  const roster = await listClients();
  const client = roster.find((c) => c.id === id);
  if (!client) return null;

  if (patch.stage && patch.stage !== client.stage && isStageId(patch.stage)) {
    const to = PIPELINE.find((s) => s.id === patch.stage);
    pushEvent(client, 'stage', `Stage advanced → ${to?.label ?? patch.stage}`);
    client.stage = patch.stage;
  }

  for (const key of ['name', 'company', 'email', 'phone', 'website', 'industry', 'notes'] as const) {
    if (patch[key] !== undefined) client[key] = patch[key];
  }
  if (patch.monthlySpend !== undefined) client.monthlySpend = patch.monthlySpend;
  if (patch.retainer !== undefined) client.retainer = patch.retainer;
  if (patch.tags) client.tags = patch.tags;
  if (patch.squad) client.squad = validAgentIds(patch.squad);

  if (patch.linkIntegration && isIntegrationId(patch.linkIntegration.id)) {
    const { id: intId, externalRef } = patch.linkIntegration;
    if (!client.integrations.some((i) => i.id === intId)) {
      client.integrations = [
        ...client.integrations,
        { id: intId, externalRef, linkedAt: new Date().toISOString() },
      ];
      const def = INTEGRATION_REGISTRY.find((d) => d.id === intId);
      pushEvent(client, 'integration', `${def?.name ?? intId} linked${externalRef ? ` (${externalRef})` : ''}`);
    }
  }
  if (patch.unlinkIntegration) {
    const def = INTEGRATION_REGISTRY.find((d) => d.id === patch.unlinkIntegration);
    if (client.integrations.some((i) => i.id === patch.unlinkIntegration)) {
      client.integrations = client.integrations.filter((i) => i.id !== patch.unlinkIntegration);
      pushEvent(client, 'integration', `${def?.name ?? patch.unlinkIntegration} unlinked`);
    }
  }

  if (patch.logEvent?.summary) {
    pushEvent(client, patch.logEvent.kind ?? 'note', patch.logEvent.summary);
  }

  client.updatedAt = new Date().toISOString();
  client.health = computeHealth(client);
  await saveRoster(roster);
  return client;
}

export async function deleteClient(id: string): Promise<boolean> {
  const roster = await listClients();
  const next = roster.filter((c) => c.id !== id);
  if (next.length === roster.length) return false;
  await saveRoster(next);
  return true;
}

// ─── COMMAND SUMMARY ─────────────────────────────────────────────────────────

export function summarize(roster: CrmClient[]): CrmSummary {
  const byStage = Object.fromEntries(PIPELINE.map((s) => [s.id, 0])) as Record<StageId, number>;
  let retainer = 0;
  let spend = 0;
  let health = 0;
  let linked = 0;
  let active = 0;
  for (const c of roster) {
    byStage[c.stage] += 1;
    retainer += c.retainer ?? 0;
    spend += c.monthlySpend ?? 0;
    health += c.health;
    linked += c.integrations.length;
    if (c.stage === 'inflight' || c.stage === 'orbit') active += 1;
  }
  return {
    durable: storeIsDurable(),
    totalClients: roster.length,
    activeClients: active,
    monthlyRetainer: retainer,
    spendUnderManagement: spend,
    avgHealth: roster.length ? Math.round(health / roster.length) : 0,
    byStage,
    integrationsLinked: linked,
  };
}
