// ─── PIXEL PILOT · THE STACK ─────────────────────────────────────────────────
// The "business brain" — the full, curated catalog of apps, connectors and tools
// Pixel Pilot flies with, grouped by business function. Each tool declares HOW it
// connects (native OAuth in-product, via the Zapier bridge, via an agent/MCP, or
// on the roadmap) and, for native connectors, the env vars that make it live.
//
// This is data only — the surface (app/(marketing)/stack) renders it, and the
// API (/api/pixel-pilot/stack) reports live status. Keeping it here means the
// catalog is the single source of truth for "what Pixel Pilot can plug into."

export type StackCategory =
  | 'Advertising'
  | 'Commerce'
  | 'Analytics & Attribution'
  | 'CRM & Sales'
  | 'Email & SMS'
  | 'Payments & Finance'
  | 'Data & Warehouse'
  | 'Comms & Ops'
  | 'Creative & Content'
  | 'Automation';

/** How a tool connects. `native` = first-class OAuth we own; `zapier` = via the
 *  Catch-Hook bridge; `mcp` = through an agent tool; `planned` = on the roadmap. */
export type IntegrationVia = 'native' | 'zapier' | 'mcp' | 'planned';

export interface StackTool {
  readonly id: string;
  readonly name: string;
  readonly category: StackCategory;
  /** One line: what it does for Pixel Pilot. */
  readonly blurb: string;
  readonly via: IntegrationVia;
  /** Brand accent for the chip. */
  readonly hue: string;
  /** Native connectors only — env vars whose presence means "live". */
  readonly env?: readonly string[];
  /** Flagged when the integration is wired and connected today. */
  readonly connected?: boolean;
}

export interface CategoryMeta {
  readonly id: StackCategory;
  readonly summary: string;
  readonly hue: string;
}

export const STACK_CATEGORIES: readonly CategoryMeta[] = [
  { id: 'Advertising', summary: 'The channels Pixel Pilot flies to profit.', hue: '#00D4FF' },
  { id: 'Commerce', summary: 'The ground truth — real orders, margin & LTV.', hue: '#95BF47' },
  { id: 'Analytics & Attribution', summary: 'Honest signal post-ATT — what really drove the sale.', hue: '#6C63FF' },
  { id: 'CRM & Sales', summary: 'Leads and pipeline, worked end to end.', hue: '#FF7A45' },
  { id: 'Email & SMS', summary: 'Owned lifecycle that compounds paid.', hue: '#FF2E9A' },
  { id: 'Payments & Finance', summary: 'Cash, revenue and margin ground truth.', hue: '#635BFF' },
  { id: 'Data & Warehouse', summary: 'The brain’s long-term memory.', hue: '#00B4D8' },
  { id: 'Comms & Ops', summary: 'Where the team approves and gets alerted.', hue: '#C9A84C' },
  { id: 'Creative & Content', summary: 'The creative genome — fresh, on-brand, at scale.', hue: '#FF4F9A' },
  { id: 'Automation', summary: 'The connective tissue to everything else.', hue: '#FFB020' },
];

export const STACK: readonly StackTool[] = [
  // ── Advertising ────────────────────────────────────────────────────────────
  { id: 'meta_ads', name: 'Meta Ads', category: 'Advertising', blurb: 'Spend, delivery + autonomous budget & bids.', via: 'native', hue: '#1877F2', env: ['META_ADS_CLIENT_ID', 'META_ADS_CLIENT_SECRET'] },
  { id: 'google_ads', name: 'Google Ads', category: 'Advertising', blurb: 'Search · PMax · Shopping — steer tCPA/tROAS.', via: 'native', hue: '#34A853', env: ['GOOGLE_ADS_CLIENT_ID', 'GOOGLE_ADS_CLIENT_SECRET'] },
  { id: 'tiktok_ads', name: 'TikTok Ads', category: 'Advertising', blurb: 'Velocity channel; auto-ship fresh variants.', via: 'native', hue: '#FF0050', env: ['TIKTOK_ADS_CLIENT_ID', 'TIKTOK_ADS_CLIENT_SECRET'] },
  { id: 'linkedin_ads', name: 'LinkedIn Ads', category: 'Advertising', blurb: 'B2B demand + high-intent lead gen.', via: 'planned', hue: '#0A66C2' },
  { id: 'pinterest_ads', name: 'Pinterest Ads', category: 'Advertising', blurb: 'High-intent visual discovery.', via: 'planned', hue: '#E60023' },
  { id: 'amazon_ads', name: 'Amazon Ads', category: 'Advertising', blurb: 'Retail media + Sponsored Products.', via: 'planned', hue: '#FF9900' },

  // ── Commerce ───────────────────────────────────────────────────────────────
  { id: 'shopify', name: 'Shopify', category: 'Commerce', blurb: 'Orders, COGS, LTV — the profit the bids obey.', via: 'native', hue: '#95BF47', env: ['SHOPIFY_CLIENT_ID', 'SHOPIFY_CLIENT_SECRET'] },
  { id: 'woocommerce', name: 'WooCommerce', category: 'Commerce', blurb: 'WordPress storefront orders + margin.', via: 'zapier', hue: '#96588A' },
  { id: 'bigcommerce', name: 'BigCommerce', category: 'Commerce', blurb: 'Enterprise storefront data.', via: 'zapier', hue: '#121118' },
  { id: 'amazon_seller', name: 'Amazon Seller', category: 'Commerce', blurb: 'Marketplace sales + inventory.', via: 'planned', hue: '#FF9900' },

  // ── Analytics & Attribution ────────────────────────────────────────────────
  { id: 'ga4', name: 'Google Analytics 4', category: 'Analytics & Attribution', blurb: 'Site behavior + conversion signal.', via: 'zapier', hue: '#E37400' },
  { id: 'triple_whale', name: 'Triple Whale', category: 'Analytics & Attribution', blurb: 'DTC profit + attribution truth.', via: 'planned', hue: '#1A1A2E' },
  { id: 'northbeam', name: 'Northbeam', category: 'Analytics & Attribution', blurb: 'Multi-touch + incrementality truth.', via: 'planned', hue: '#6C63FF' },
  { id: 'segment', name: 'Segment', category: 'Analytics & Attribution', blurb: 'Customer data pipe (CDP).', via: 'planned', hue: '#52BD95' },
  { id: 'amplitude', name: 'Amplitude', category: 'Analytics & Attribution', blurb: 'Product + funnel analytics.', via: 'mcp', hue: '#1E61F0' },

  // ── CRM & Sales ────────────────────────────────────────────────────────────
  { id: 'hubspot', name: 'HubSpot', category: 'CRM & Sales', blurb: 'Leads, deals, lifecycle.', via: 'zapier', hue: '#FF7A59' },
  { id: 'salesforce', name: 'Salesforce', category: 'CRM & Sales', blurb: 'Enterprise CRM + pipeline.', via: 'planned', hue: '#00A1E0' },
  { id: 'close', name: 'Close', category: 'CRM & Sales', blurb: 'Inside-sales CRM + calling.', via: 'mcp', hue: '#3B4A9C' },

  // ── Email & SMS ────────────────────────────────────────────────────────────
  { id: 'klaviyo', name: 'Klaviyo', category: 'Email & SMS', blurb: 'Lifecycle email + segments.', via: 'zapier', hue: '#232426' },
  { id: 'postscript', name: 'Postscript', category: 'Email & SMS', blurb: 'SMS built for DTC.', via: 'planned', hue: '#FF4D4D' },
  { id: 'mailchimp', name: 'Mailchimp', category: 'Email & SMS', blurb: 'Email campaigns + audiences.', via: 'zapier', hue: '#FFE01B' },
  { id: 'customerio', name: 'Customer.io', category: 'Email & SMS', blurb: 'Behavioral messaging.', via: 'planned', hue: '#7131FF' },

  // ── Payments & Finance ─────────────────────────────────────────────────────
  { id: 'stripe', name: 'Stripe', category: 'Payments & Finance', blurb: 'Payments, revenue, MRR.', via: 'zapier', hue: '#635BFF' },
  { id: 'paypal', name: 'PayPal', category: 'Payments & Finance', blurb: 'Payments + payouts.', via: 'zapier', hue: '#003087' },
  { id: 'quickbooks', name: 'QuickBooks', category: 'Payments & Finance', blurb: 'Accounting truth the buyer bids against.', via: 'native', hue: '#2CA01C', env: ['QUICKBOOKS_CLIENT_ID', 'QUICKBOOKS_CLIENT_SECRET'] },
  { id: 'ramp', name: 'Ramp', category: 'Payments & Finance', blurb: 'Spend controls + card data.', via: 'planned', hue: '#E9FC87' },

  // ── Data & Warehouse ───────────────────────────────────────────────────────
  { id: 'bigquery', name: 'BigQuery', category: 'Data & Warehouse', blurb: 'Warehouse for modeled profit.', via: 'planned', hue: '#4285F4' },
  { id: 'snowflake', name: 'Snowflake', category: 'Data & Warehouse', blurb: 'Enterprise data cloud.', via: 'planned', hue: '#29B5E8' },
  { id: 'google_sheets', name: 'Google Sheets', category: 'Data & Warehouse', blurb: 'Lightweight logs + ops.', via: 'zapier', hue: '#0F9D58' },
  { id: 'fivetran', name: 'Fivetran', category: 'Data & Warehouse', blurb: 'Managed data pipelines.', via: 'planned', hue: '#0073FF' },

  // ── Comms & Ops ────────────────────────────────────────────────────────────
  { id: 'slack', name: 'Slack', category: 'Comms & Ops', blurb: 'War-room alerts + approvals.', via: 'zapier', hue: '#4A154B', connected: true },
  { id: 'gmail', name: 'Gmail', category: 'Comms & Ops', blurb: 'Outreach + drafts.', via: 'zapier', hue: '#EA4335', connected: true },
  { id: 'google_calendar', name: 'Google Calendar', category: 'Comms & Ops', blurb: 'Scheduling + cadence.', via: 'zapier', hue: '#4285F4' },
  { id: 'notion', name: 'Notion', category: 'Comms & Ops', blurb: 'Docs + knowledge base.', via: 'mcp', hue: '#111111' },
  { id: 'linear', name: 'Linear', category: 'Comms & Ops', blurb: 'Issues + product roadmap.', via: 'mcp', hue: '#5E6AD2' },

  // ── Creative & Content ─────────────────────────────────────────────────────
  { id: 'higgsfield', name: 'Creative Forge', category: 'Creative & Content', blurb: 'Pixel Pilot’s render engine — ad stills, reels & video.', via: 'native', hue: '#FF4F9A', connected: true },
  { id: 'canva', name: 'Canva', category: 'Creative & Content', blurb: 'On-brand static creative.', via: 'zapier', hue: '#00C4CC' },
  { id: 'figma', name: 'Figma', category: 'Creative & Content', blurb: 'Design source + handoff.', via: 'mcp', hue: '#F24E1E' },

  // ── Automation ─────────────────────────────────────────────────────────────
  { id: 'zapier', name: 'Zapier', category: 'Automation', blurb: 'Bridge to 9,000+ apps.', via: 'native', hue: '#FF4F00', env: ['ZAPIER_HOOK_URL'] },
  { id: 'n8n', name: 'n8n', category: 'Automation', blurb: 'Self-hosted workflow engine.', via: 'native', hue: '#EA4B71', env: ['N8N_BASE_URL'] },
  { id: 'make', name: 'Make', category: 'Automation', blurb: 'Visual automation builder.', via: 'planned', hue: '#6D00CC' },
];

/** Is the Zapier fan-out bridge configured? When set, every `via: 'zapier'`
 *  tool becomes reachable through it and reads as live. */
export function zapierBridgeLive(): boolean {
  return Boolean(process.env.ZAPIER_HOOK_URL);
}

/** Is a tool live in the current environment? Native connectors light up when
 *  their credentials are present; Zapier-bridged tools light up when the hook is
 *  set; a few internal tools are always connected. */
export function toolIsLive(tool: StackTool): boolean {
  if (tool.connected) return true;
  if (tool.via === 'native' && tool.env) return tool.env.every((e) => Boolean(process.env[e]));
  if (tool.via === 'zapier') return zapierBridgeLive();
  return false;
}

export function stackByCategory(): { meta: CategoryMeta; tools: StackTool[] }[] {
  return STACK_CATEGORIES.map((meta) => ({
    meta,
    tools: STACK.filter((t) => t.category === meta.id),
  }));
}

export interface StackStats {
  readonly total: number;
  readonly live: number;
  readonly native: number;
  readonly viaZapier: number;
  readonly planned: number;
}

export function stackStats(): StackStats {
  return {
    total: STACK.length,
    live: STACK.filter(toolIsLive).length,
    native: STACK.filter((t) => t.via === 'native').length,
    viaZapier: STACK.filter((t) => t.via === 'zapier').length,
    planned: STACK.filter((t) => t.via === 'planned').length,
  };
}
