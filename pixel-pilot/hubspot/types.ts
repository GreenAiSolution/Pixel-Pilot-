// ─── PIXEL PILOT · HUBSPOT TYPES ─────────────────────────────────────────────
// Domain + normalized types for the HubSpot backend connector. Server-only.

/**
 * The tenancy handle for a connected HubSpot account: the portal (hub) id, which
 * HubSpot returns on token exchange. Tokens are keyed as `pp:hubspot:tokens:{ref}`,
 * so one deployment can hold many customers' HubSpots.
 */
export type ConnectionRef = string;

/** OAuth scopes we request when a customer connects HubSpot. */
export const HUBSPOT_SCOPES = [
  'crm.objects.contacts.read',
  'crm.objects.deals.read',
  'crm.schemas.deals.read',
  'forms',
] as const;

/** Stored ENCRYPTED at rest — never returned to callers. */
export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // ms epoch
  portalId: string;
  scopes: string[];
}

/** Safe, non-secret view of a connection. */
export interface HubSpotConnection {
  portalId: string;
  scopes: string[];
  expiresAt: number;
  connectedAt: string;
}

export type LifecycleStage =
  | 'subscriber'
  | 'lead'
  | 'marketingqualifiedlead'
  | 'salesqualifiedlead'
  | 'opportunity'
  | 'customer'
  | 'evangelist'
  | 'other'
  | (string & {}); // keep the union open for custom stages

export interface HubSpotContact {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  lifecycleStage: LifecycleStage | null;
  /** Marketing-consent flag from hs_marketable_status; null when the portal doesn't set it. */
  marketable: boolean | null;
  createdAt: string;
  lastModifiedAt: string;
}

export interface HubSpotDeal {
  id: string;
  name: string;
  amount: number | null;
  pipelineId: string;
  stageId: string;
  stageLabel: string; // resolved from the pipeline definition
  isClosedWon: boolean;
  isClosedLost: boolean;
  closeDate: string | null;
  createdAt: string;
  lastModifiedAt: string;
  associatedContactIds: string[];
}

export interface HubSpotPipelineStage {
  id: string;
  label: string;
  displayOrder: number;
  probability: number; // 0..1
  isClosedWon: boolean;
  isClosedLost: boolean;
}

export interface HubSpotPipeline {
  id: string;
  label: string;
  stages: HubSpotPipelineStage[];
}

// ── The Ledger-facing contract ───────────────────────────────────────────────

export interface PipelineStageProfit {
  stageId: string;
  stageLabel: string;
  isClosedWon: boolean;
  dealCount: number; // deals currently in this stage
  totalValue: number; // sum of deal amounts in this stage
  avgDaysInStage: number;
}

export interface PipelineProfit {
  pipelineId: string;
  pipelineLabel: string;
  window: { start: string; end: string };
  currency: string;
  stages: PipelineStageProfit[];

  /** Closed-won value — the money that actually lands. */
  closedWon: {
    dealCount: number;
    totalValue: number;
    averageDealValue: number;
  };

  /**
   * Cost-per-stage INPUTS. Ledger divides ad spend (sourced from the ad
   * platforms) by these counts to derive cost-per-stage / cost-per-closed-won.
   */
  costInputs: {
    entriesByStage: Record<string, number>; // stageId → deals that reached it
    closedWonByStage: Record<string, number>;
  };

  /** How fast pipeline moves. */
  velocity: {
    avgDaysToClose: number; // created → closed-won
    avgDaysInStage: Record<string, number>;
    stageConversionRate: Record<string, number>; // stage → next-stage %
  };

  /** CRM-sourced lifetime value. */
  ltv: {
    perWonContact: number; // closed-won value / distinct won contacts
    method: 'crm-closed-won';
  };

  generatedAt: string;
}
