// ─── PIXEL PILOT · CRM SHARED (client-safe) ──────────────────────────────────
// Pure data + types for the Orbital CRM, importable from browser components.
// No env reads, no node built-ins — the server-only logic (persistence,
// integration status, side-effects) lives in ./crm, which re-exports this.

export type StageId =
  | 'radar'
  | 'hailing'
  | 'docking'
  | 'onboarding'
  | 'inflight'
  | 'orbit'
  | 'lost';

export interface PipelineStage {
  readonly id: StageId;
  readonly label: string;
  readonly description: string;
  readonly hue: string;
  /** Contribution to the health score — deeper in the funnel = healthier. */
  readonly weight: number;
  readonly terminal?: boolean;
}

export const PIPELINE: PipelineStage[] = [
  { id: 'radar', label: 'On Radar', description: 'Scouted — a blip worth flying toward', hue: '#4A5060', weight: 5 },
  { id: 'hailing', label: 'Hailing', description: 'First contact made — outreach in the air', hue: '#00D4FF', weight: 12 },
  { id: 'docking', label: 'Docking', description: 'Demo / negotiation — locking the approach', hue: '#6C63FF', weight: 20 },
  { id: 'onboarding', label: 'Onboarding', description: 'Signed — wiring their stack into the deck', hue: '#FF9F1C', weight: 28 },
  { id: 'inflight', label: 'In-Flight', description: 'Live — Pixel Pilot is flying their spend', hue: '#FF2E9A', weight: 36 },
  { id: 'orbit', label: 'In Orbit', description: 'Retained — compounding, referring, expanding', hue: '#7CFF6B', weight: 40 },
  { id: 'lost', label: 'Lost Signal', description: 'Gone dark — parked for re-engagement', hue: '#2A2F3C', weight: 0, terminal: true },
];

export function isStageId(v: string): v is StageId {
  return PIPELINE.some((s) => s.id === v);
}

export type ClientSource = 'moneygun' | 'cold-call' | 'inbound' | 'referral' | 'manual';

export const CLIENT_SOURCES: ClientSource[] = ['moneygun', 'cold-call', 'inbound', 'referral', 'manual'];

export interface ClientIntegration {
  /** An id from the integration registry (see ./crm). */
  readonly id: string;
  /** Client-side reference — shop domain, portal id, webhook URL, account id… */
  readonly externalRef?: string;
  readonly linkedAt: string;
}

export interface CrmEvent {
  readonly at: string;
  readonly kind: 'created' | 'stage' | 'integration' | 'note' | 'mission' | 'signal';
  readonly summary: string;
}

export interface CrmClient {
  readonly id: string;
  /** Primary human contact. */
  name: string;
  company: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  /** Monthly ad spend under management (USD). */
  monthlySpend?: number;
  /** What the client pays Pixel Pilot monthly (USD). */
  retainer?: number;
  stage: StageId;
  source: ClientSource;
  integrations: ClientIntegration[];
  /** Agent ids from PIXEL_AGENTS assigned to this client. */
  squad: string[];
  tags: string[];
  notes?: string;
  /** 0–100, recomputed on every write. */
  health: number;
  timeline: CrmEvent[];
  readonly createdAt: string;
  updatedAt: string;
}

export interface CrmSummary {
  durable: boolean;
  totalClients: number;
  activeClients: number;
  monthlyRetainer: number;
  spendUnderManagement: number;
  avgHealth: number;
  byStage: Record<StageId, number>;
  integrationsLinked: number;
}

// The over-the-wire shape of /api/pixel-pilot/crm/integrations entries.
export interface IntegrationInfo {
  id: string;
  name: string;
  category: string;
  hue: string;
  wiring: 'oauth' | 'engine' | 'relay';
  powers: string;
  wiredVia: string;
  status: 'wired' | 'relay' | 'dormant';
  connected?: boolean;
}
