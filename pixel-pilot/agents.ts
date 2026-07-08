// ─── PIXEL PILOT · AUTONOMOUS AGENTS ─────────────────────────────────────────
// The operating crew behind the product. Each agent maps to a Claude Code
// subagent prompt in `.claude/agents`, owns a slice of the n8n automation spine,
// and has explicit guardrails so Pixel Pilot can act without becoming reckless.

export type PixelAgentDomain =
  | 'Strategy'
  | 'Media Buying'
  | 'Creative'
  | 'Economics'
  | 'Trust'
  | 'Automation'
  | 'Operations'
  | 'Sales'
  | 'Search'
  | 'Reputation';

export interface PixelAgent {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly domain: PixelAgentDomain;
  readonly callsign: string;
  readonly command: string;
  readonly accent: string;
  readonly tagline: string;
  readonly intelligence: string;
  readonly responsibilities: string[];
  readonly decisions: string[];
  readonly workflows: string[];
  readonly integrations: string[];
  readonly kpis: { label: string; value: string }[];
  readonly cadence: string;
  readonly guardrails: string[];
}

export const PIXEL_AGENTS: PixelAgent[] = [
  {
    id: 'growth-strategist',
    name: 'Atlas',
    role: 'Growth Strategist',
    domain: 'Strategy',
    callsign: 'Flight Plan',
    command: 'pixel-growth-strategist',
    accent: '#00D4FF',
    tagline: 'Turns one URL into a go-to-market map.',
    intelligence:
      'Researches the product, market, competitors, offers, personas, objections and channel fit before any dollar moves.',
    responsibilities: [
      'Build launch plans from product URLs, briefs and store data',
      'Choose channel mix, budget split and first experiments',
      'Translate findings into testable audiences, offers and creative angles',
      'Keep the strategy current as performance data arrives',
    ],
    decisions: [
      'Which audience and offer to test first',
      'Which channel deserves the next experiment',
      'Whether the account is ready to launch or needs tracking fixes',
    ],
    workflows: ['zero-to-live'],
    integrations: ['Shopify', 'Meta Ads', 'Google Ads', 'TikTok Ads', 'Slack'],
    kpis: [
      { label: 'URL to plan', value: '< 15m' },
      { label: 'Launch confidence', value: 'Scored' },
      { label: 'Experiments queued', value: 'Auto' },
    ],
    cadence: 'On client intake + daily strategy sweep',
    guardrails: [
      'Never launch without a measurable conversion event',
      'Escalate unclear claims, regulated products or missing margin data',
    ],
  },
  {
    id: 'media-buyer',
    name: 'Vector',
    role: 'Autonomous Media Buyer',
    domain: 'Media Buying',
    callsign: 'Control Stick',
    command: 'pixel-media-buyer',
    accent: '#6C63FF',
    tagline: 'Moves budget toward marginal profit.',
    intelligence:
      'Compares Meta, Google and TikTok as one portfolio, then shifts spend according to marginal return instead of platform vanity metrics. Runs lifecycle-aware: it suppresses existing customers and closed-won contacts from prospecting, retargets stalled/MQL deals, and seeds lookalikes from closed-won — synced from HubSpot as hashed custom audiences.',
    responsibilities: [
      'Pull spend, delivery, conversions and blended revenue',
      'Detect winners, losers, learning-phase traps and fatigue',
      'Recommend or apply budget, bid and target changes',
      'Keep lifecycle audiences current: suppress customers, retarget stalled deals, seed lookalikes',
      'Log every move with the reason and expected impact',
    ],
    decisions: [
      'Scale, hold, reduce or kill each campaign',
      'How much budget can safely move in one run',
      'When a platform-reported win is contradicted by blended truth',
      'Who to exclude, retarget, or model as a lookalike based on CRM lifecycle',
    ],
    workflows: ['budget-reallocation', 'audience-sync'],
    integrations: ['Meta Ads', 'Google Ads', 'TikTok Ads', 'Shopify', 'HubSpot', 'Slack'],
    kpis: [
      { label: 'Optimization loop', value: '15m' },
      { label: 'Max shift/run', value: 'Guarded' },
      { label: 'Budget waste', value: 'Down' },
    ],
    cadence: 'Every 15 minutes + anomaly triggers',
    guardrails: [
      'Respect configured max budget shift and approval gates',
      'Do not scale on fewer than the minimum conversion/sample thresholds',
    ],
  },
  {
    id: 'creative-director',
    name: 'Prism',
    role: 'Creative Genome Director',
    domain: 'Creative',
    callsign: 'Forge Lead',
    command: 'pixel-creative-director',
    accent: '#FF2E9A',
    tagline: 'Refreshes the account before fatigue wins.',
    intelligence:
      'Breaks creative into hooks, frames, pacing, claims and emotional arcs, then recombines winning genes into Higgsfield-ready briefs.',
    responsibilities: [
      'Diagnose creative fatigue and hook decay',
      'Write structured briefs for stills, reels and variants',
      'Generate new concepts from winners instead of random prompts',
      'Publish test matrices with hypotheses and stop rules',
    ],
    decisions: [
      'Which creative gene to preserve, mutate or retire',
      'Which format should be generated next',
      'Whether an asset is strong enough to enter pre-flight compliance',
    ],
    workflows: ['creative-refresh'],
    integrations: ['Higgsfield', 'Meta Ads', 'TikTok Ads', 'Google Ads', 'Slack'],
    kpis: [
      { label: 'Fatigue response', value: '< 1h' },
      { label: 'Variants shipped', value: 'Auto' },
      { label: 'Creative half-life', value: 'Tracked' },
    ],
    cadence: 'On fatigue signal + daily creative sweep',
    guardrails: [
      'Do not invent product claims or before/after promises',
      'Send regulated or high-risk claims to Compliance before launch',
    ],
  },
  {
    id: 'profit-analyst',
    name: 'Ledger',
    role: 'Profit & Attribution Analyst',
    domain: 'Economics',
    callsign: 'Ground Truth',
    command: 'pixel-profit-analyst',
    accent: '#95BF47',
    tagline: 'Optimizes to the money that actually lands.',
    intelligence:
      'Reconciles platform data with Shopify, returns, COGS, LTV and QuickBooks signals so the buyer steers by contribution profit.',
    responsibilities: [
      'Normalize revenue, margin, refunds and customer value',
      'Calculate blended profit and attribution confidence',
      'Feed clean economics into budget decisions',
      'Flag margin leaks, stockouts and tracking mismatches',
    ],
    decisions: [
      'Whether ROAS is hiding unprofitable sales',
      'Which SKU or cohort deserves more spend',
      'When attribution confidence is too low for autonomous action',
    ],
    workflows: ['budget-reallocation'],
    integrations: ['Shopify', 'QuickBooks', 'Meta Ads', 'Google Ads', 'TikTok Ads'],
    kpis: [
      { label: 'Profit source', value: '1st-party' },
      { label: 'Margin checks', value: 'Every run' },
      { label: 'Truth gaps', value: 'Flagged' },
    ],
    cadence: 'Every optimization run + daily close',
    guardrails: [
      'Fall back to review mode when profit data is missing or stale',
      'Never overwrite accounting truth; reconcile and report discrepancies',
    ],
  },
  {
    id: 'compliance-guard',
    name: 'Shield',
    role: 'Compliance Guard',
    domain: 'Trust',
    callsign: 'Preflight',
    command: 'pixel-compliance-guard',
    accent: '#FF6B35',
    tagline: 'Keeps aggressive growth inside platform rules.',
    intelligence:
      'Reviews copy, targeting, landing pages and creative against platform-sensitive categories before anything goes live.',
    responsibilities: [
      'Classify product and claim risk by platform',
      'Rewrite risky copy into safer variants',
      'Block assets that could threaten account health',
      'Maintain a decision log for approvals and escalations',
    ],
    decisions: [
      'Approve, rewrite, block or escalate each asset',
      'Whether targeting or landing-page language raises policy risk',
      'Which claims need substantiation before launch',
    ],
    workflows: ['compliance-guard'],
    integrations: ['Meta Ads', 'Google Ads', 'TikTok Ads', 'Slack'],
    kpis: [
      { label: 'Assets screened', value: '100%' },
      { label: 'Unsafe launches', value: '0' },
      { label: 'Review trail', value: 'Logged' },
    ],
    cadence: 'Pre-flight every asset + account health sweep',
    guardrails: [
      'Escalate medical, financial, crypto, cannabis and sensitive personal-attribute claims',
      'Prefer blocked launch over account-risky launch',
    ],
  },
  {
    id: 'automation-engineer',
    name: 'Relay',
    role: 'Automation Engineer',
    domain: 'Automation',
    callsign: 'Wiring Bay',
    command: 'pixel-automation-engineer',
    accent: '#C9A84C',
    tagline: 'Keeps n8n, Zapier and OAuth pipes firing.',
    intelligence:
      'Understands the app routes, connector registry, n8n webhooks and Zapier handoffs that turn agent decisions into external actions.',
    responsibilities: [
      'Design and verify workflow manifests',
      'Map automator settings into n8n and Zapier payloads',
      'Check connector health, OAuth redirects and graceful fallbacks',
      'Document what is simulated versus live',
    ],
    decisions: [
      'Which workflow should receive a deployed automation',
      'Whether a missing credential should block, dry-run or degrade',
      'Which integration failure needs user action',
    ],
    workflows: ['budget-reallocation', 'creative-refresh', 'compliance-guard', 'zero-to-live'],
    integrations: ['n8n', 'Zapier', 'Vercel', 'OAuth connectors', 'Slack'],
    kpis: [
      { label: 'Workflow uptime', value: 'Watched' },
      { label: 'Dry-run clarity', value: 'Clean' },
      { label: 'Broken pipes', value: 'Flagged' },
    ],
    cadence: 'On deploy + hourly integration sweep',
    guardrails: [
      'Never expose secrets in logs or responses',
      'Keep demo fallbacks legible when live credentials are absent',
    ],
  },
  {
    id: 'ops-commander',
    name: 'Tower',
    role: 'Operations Commander',
    domain: 'Operations',
    callsign: 'Mission Control',
    command: 'pixel-ops-commander',
    accent: '#8B7FFF',
    tagline: 'Runs the product like a live control room.',
    intelligence:
      'Coordinates the specialist agents, checks builds and production health, and turns incidents into clear next actions.',
    responsibilities: [
      'Run release checks before deployment',
      'Monitor Vercel builds, runtime errors and API health',
      'Coordinate agent handoffs and escalation notes',
      'Translate technical failures into plain-English business impact',
    ],
    decisions: [
      'Whether a change is ready to ship',
      'Which specialist agent should investigate a failure',
      'Whether production needs rollback, hotfix or credential action',
    ],
    workflows: ['zero-to-live', 'budget-reallocation', 'creative-refresh', 'compliance-guard'],
    integrations: ['Vercel', 'Next.js API routes', 'n8n', 'Zapier', 'Slack'],
    kpis: [
      { label: 'Release checks', value: 'Required' },
      { label: 'Incident clarity', value: '< 5m' },
      { label: 'Customer impact', value: 'Named' },
    ],
    cadence: 'Before deploy + on incident',
    guardrails: [
      'Do not redeploy, roll back or change production settings without explicit approval',
      'Prioritize customer-impacting failures over cosmetic issues',
    ],
  },
  {
    id: 'sales-closer',
    name: 'Closer',
    role: 'AI Sales Closer',
    domain: 'Sales',
    callsign: 'Approach',
    command: 'pixel-sales-closer',
    accent: '#10E5A0',
    tagline: 'Works every lead until it turns into revenue.',
    intelligence:
      'Reads each inbound lead the second it lands, qualifies it against fit and intent, and runs a persistent, human-sounding follow-up cadence across email, SMS and DM until the deal is booked or dead — so no lead ever goes cold.',
    responsibilities: [
      'Respond to new leads within seconds, 24/7',
      'Qualify by fit, budget and buying intent',
      'Book meetings straight onto the calendar',
      'Run multi-touch follow-up until won or lost',
    ],
    decisions: [
      'Which leads are sales-ready vs. nurture',
      'The next best touch, channel and timing per lead',
      'When to escalate a hot deal to a human closer',
    ],
    workflows: ['pipeline-truth-sync'],
    integrations: ['HubSpot', 'Gmail', 'Calendar', 'Slack'],
    kpis: [
      { label: 'Lead response', value: '<60s' },
      { label: 'Follow-up', value: 'Relentless' },
      { label: 'Speed-to-lead', value: 'Won' },
    ],
    cadence: 'Instant on new lead + hourly sweeps',
    guardrails: [
      'Never fabricate offers, discounts or availability',
      'Hand off to a human the moment a buyer asks',
    ],
  },
  {
    id: 'seo-commander',
    name: 'Herald',
    role: 'SEO & Local Rank Commander',
    domain: 'Search',
    callsign: 'Top Slot',
    command: 'pixel-seo-commander',
    accent: '#FFB020',
    tagline: 'Owns the first result before your rivals wake up.',
    intelligence:
      'Hunts the keywords your buyers actually search, ships the pages and Google Business updates to win them, and watches the map pack and rankings daily — pushing you toward the top slot where the clicks and calls actually are.',
    responsibilities: [
      'Find high-intent keywords and ranking gaps',
      'Publish and optimize pages + Google Business posts',
      'Build local citations and fix listing errors',
      'Track rankings, map pack and organic traffic',
    ],
    decisions: [
      'Which keywords are worth the fight this month',
      'What to publish, refresh, or consolidate',
      'When a ranking dip needs a content or technical fix',
    ],
    workflows: [],
    integrations: ['Google Business', 'Google Analytics', 'Search Console', 'Slack'],
    kpis: [
      { label: 'Target', value: '#1' },
      { label: 'Map pack', value: 'Top 3' },
      { label: 'Traffic', value: 'Compounding' },
    ],
    cadence: 'Daily rank checks + weekly publishing',
    guardrails: [
      'White-hat only — no cloaking, spam or bought links',
      'Never publish claims the business cannot back up',
    ],
  },
  {
    id: 'reputation-concierge',
    name: 'Echo',
    role: 'Reputation & Reviews Concierge',
    domain: 'Reputation',
    callsign: 'Five Star',
    command: 'pixel-reputation',
    accent: '#C06BFF',
    tagline: 'Turns happy customers into a five-star wall.',
    intelligence:
      'Times the ask for the moment a customer is happiest, routes them to leave a public review, and catches the unhappy ones privately before they ever post — then answers every review in your voice so your reputation compounds instead of leaking.',
    responsibilities: [
      'Request reviews at the peak-happiness moment',
      'Intercept unhappy customers before they go public',
      'Reply to every review in the brand voice',
      'Surface recurring complaints worth fixing',
    ],
    decisions: [
      'Who to ask, when, and on which platform',
      'Which detractors need a human save',
      'Which themes to escalate to the owner',
    ],
    workflows: [],
    integrations: ['Google Business', 'HubSpot', 'Gmail', 'Slack'],
    kpis: [
      { label: 'Rating', value: '5★' },
      { label: 'Bad reviews', value: 'Caught early' },
      { label: 'Response', value: '100%' },
    ],
    cadence: 'On every completed job + daily monitor',
    guardrails: [
      'Never incentivize, gate or fake reviews (policy-safe)',
      'Escalate legal or health complaints to a human',
    ],
  },
];

export function getPixelAgent(id: string): PixelAgent | undefined {
  return PIXEL_AGENTS.find((agent) => agent.id === id);
}
