// ─── CLIENT BRAIN · SCHEMA ──────────────────────────────────────────────────
// The Client Brain is the single abstraction that turns the PHX Growth agent
// fleet from "a crew that runs PHX Growth" into "an Autonomous Growth OS that
// PHX Growth installs into ANY business and operates as a high-ticket service."
//
// Every agent reads the ACTIVE Client Brain before it acts. Nothing about a
// tenant — brand, offer, pricing, ICP, compliance posture, channels, connectors,
// autonomy rules, reporting destination — is hardcoded in an agent prompt. It all
// lives here, as data. Stamp a new tenant = write one ClientBrain and set
// CLIENT_ID. That is the "install."
//
// PHX Growth itself is the REFERENCE tenant (see reference.ts), so the live site
// keeps working while the fleet becomes business-agnostic.

import type { Tier, ServicePrice } from '../pricing';

/** Regulated-category posture — drives how hard Compliance clamps claims. */
export type ComplianceCategory =
  | 'ordinary-commerce'
  | 'supplements'
  | 'beauty'
  | 'medical'
  | 'financial'
  | 'crypto'
  | 'cannabis'
  | 'employment'
  | 'housing'
  | 'credit';

/** A paid or owned channel the fleet can operate. */
export type Channel = 'meta' | 'google' | 'tiktok' | 'email' | 'sms' | 'organic-social';

/** Who the tenant sells to — used by Strategy, Sales, Creative, Demand-Gen. */
export interface Buyer {
  readonly type: string;        // e.g. "DTC founder", "performance agency"
  readonly context: string;     // e.g. "$50k–$1M+/mo in paid"
  readonly verticals: string[]; // e.g. ["apparel", "supplements"]
}

/** Brand system every creative/copy surface must honor. */
export interface Brand {
  readonly name: string;
  readonly tagline: string;
  readonly valueProp: string;   // the one-line promise the whole fleet sells
  readonly voice: string;       // tone rules
  readonly palette: readonly string[]; // hex, in order of prominence
  readonly motif: string;       // recurring metaphor/visual system
  /** Hard claims policy. Regulated niches → "defensible ranges, no guarantees". */
  readonly claimsPolicy: string;
}

/** What the tenant sells — the source of truth for every quote and invoice. */
export interface Offer {
  /** Recurring retainer tiers. Reference tenant pulls these from pricing.ts. */
  readonly tiers: readonly Tier[];
  /** One-off deliverables. */
  readonly services: readonly ServicePrice[];
  /** Where price truth lives, for the agent to cite when it must read live. */
  readonly pricingModule: string;
}

/** Which integrations are wired for this tenant. Agents degrade when false. */
export interface Connectors {
  readonly zapier: boolean;      // the glue to Slack/Gmail/etc.
  readonly gmail: boolean;       // outbound + inbound email
  readonly calendar: boolean;    // demos, cadence, run sheet
  readonly slack: boolean;       // war room / reporting destination
  readonly billing: boolean;     // QuickBooks (via Zapier)
  readonly crm: boolean;         // lead + account state
  readonly creativeGen: boolean; // Higgsfield / image + video
  readonly adPlatforms: readonly Channel[]; // which ad accounts are live
  readonly profitSource: string | null;     // e.g. "shopify" | "quickbooks" | null
}

/** Autonomy gates. Default to SAFE (stage for approval); env can promote to auto.
 *  This is the dial a client turns up as they learn to trust the system. */
export interface Autonomy {
  readonly marketingAutoPublish: boolean; // publish social without approval
  readonly emailAutoSend: boolean;        // send drafts without approval
  readonly coldEmailAutoSend: boolean;    // send cold outreach without approval
  readonly codeAutoMergeMain: boolean;    // merge to main (a live release) w/o go
  readonly billingAutoSendInvoices: boolean;
  readonly billingAutoDunning: boolean;   // auto-chase overdue AR
  readonly mediaMaxDailyBudgetShiftPct: number; // cap on autonomous spend moves
  readonly mediaApprovalAbovePct: number; // require a human above this shift size
}

/** Where the fleet reports and keeps its durable record. */
export interface Workspace {
  readonly reportChannel: string; // e.g. "#phx-growth" (Slack) or an email
  readonly durableLogDir: string; // e.g. "out/" — never depends on a 3rd-party sheet
  readonly crmModule: string;     // where account/lead state is read
  readonly dailyReportTime: string; // e.g. "18:00" local
}

/** For engineering agents: the tenant's product/platform surface, if any. */
export interface Platform {
  readonly repo: string | null;      // GitHub repo the product lives in, or null
  readonly apiBasePath: string;      // e.g. "app/api/phx-growth"
  readonly deployTarget: string;     // e.g. "vercel"
  readonly brainDir: string;         // where the tenant's TS "brain" modules live
}

/** Follow-up + operating cadence the fleet runs on. */
export interface Cadence {
  readonly followUpDays: readonly number[]; // e.g. [0, 2, 5, 10]
  readonly dunningDays: readonly number[];  // e.g. [7, 14, 30]
  readonly winBackQuietDays: number;        // reactivate after N quiet days
}

/** The complete per-tenant configuration the whole fleet reads. */
export interface ClientBrain {
  readonly id: string;        // slug, matches CLIENT_ID
  readonly name: string;      // display name of the client business
  readonly vendor: string;    // who operates the OS (white-label): "PHX Growth"
  readonly brand: Brand;
  readonly buyers: readonly Buyer[];
  readonly compliance: ComplianceCategory;
  readonly offer: Offer;
  readonly connectors: Connectors;
  readonly autonomy: Autonomy;
  readonly workspace: Workspace;
  readonly platform: Platform;
  readonly cadence: Cadence;
}

/** Read a boolean autonomy gate from env, defaulting SAFE (false) unless the
 *  tenant config opts in. Lets a client flip autonomy on without a code change. */
export function gate(envKey: string, configDefault: boolean): boolean {
  const v = process.env[envKey];
  if (v === undefined) return configDefault;
  return v === 'true' || v === '1';
}

/** The id reserved for the out-of-the-box placeholder tenant. */
export const UNCONFIGURED_ID = '_unconfigured';

/** True when the active tenant is a real, configured business rather than the
 *  out-of-the-box placeholder. Agents MUST NOT operate on an unconfigured Brain —
 *  they stop and direct the operator to stamp a real Client Brain first. */
export function isConfigured(brain: Pick<ClientBrain, 'id'>): boolean {
  return brain.id !== UNCONFIGURED_ID;
}
