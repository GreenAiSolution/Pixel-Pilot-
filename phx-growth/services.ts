// ─── PHX GROWTH · SERVICES ──────────────────────────────────────────────────
// The flight deck. FIVE services, each a real tool we build and run — the single
// source of truth for the marketing surface, the 3D orbit, the Automator and the
// pricing matrix. Edit here, it propagates everywhere.
//
// ORDER = DEFENSIBILITY. We lead with the two nobody can copy overnight — AI
// Employees (the agentic crew) and Synthetic Pre-Testing (test before you spend) —
// then the on-trend-but-crowded capabilities (Ads, Website), and close with
// Zero-to-Live, which is not a sixth tool but the whole deck flown for you.
//
// Each service maps to a live tool under app/api/phx-growth/tools/* with a
// complete workflow (phx-growth/tools.ts). The `id` and `tool` values are stable
// contracts (anchors, orbit keys, tool endpoints) — reorder freely, but never
// rename them. Categories are drawn from the existing ServiceCategory set so the
// automation planner (automations.ts) stays valid.

export type ServiceCategory =
  | 'Autonomy'
  | 'Economics'
  | 'Orchestration'
  | 'Creative'
  | 'Intelligence'
  | 'Trust';

export interface Service {
  /** Stable slug — used as anchor, orbit key, and tool id. */
  readonly id: string;
  /** Two-digit flight number shown in the UI. */
  readonly no: string;
  readonly name: string;
  readonly category: ServiceCategory;
  readonly headline: string;
  readonly body: string;
  /** The one-line proof that lands the "not basic" claim. */
  readonly edge: string;
  /** A believable hero metric for the card. */
  readonly metric: { value: string; label: string };
  /** Theme color for gradients/glow. */
  readonly accent: string;
  /** The live tool endpoint that delivers this service. */
  readonly tool: string;
}

export const SERVICES: Service[] = [
  {
    id: 'ai-employees',
    no: '01',
    name: 'AI Employees',
    category: 'Autonomy',
    headline: 'Hire a crew of AI operators that never sleep.',
    body: 'Deploy specialized agents — media buyer, profit analyst, creative director, growth strategist — straight into your business. They live in your Slack, work 24/7, log every move, and report back in plain English. Onboarding is a conversation, not a contract.',
    edge: 'A whole department on the clock in minutes — and never off it. This is the one you can’t hire, download, or copy overnight.',
    metric: { value: '24/7', label: 'On the job' },
    accent: '#6C63FF',
    tool: '/api/phx-growth/tools/employees',
  },
  {
    id: 'synthetic-pretest',
    no: '02',
    name: 'Synthetic Ad Pre-Testing',
    category: 'Intelligence',
    headline: 'Test your ads on 500 buyers before you spend $1.',
    body: 'PHX Growth builds synthetic buyer personas from your customer profile, then scores every ad variant against them — predicting scroll-stop, clarity and click intent before launch. Only the predicted winners ever see budget.',
    edge: 'Kill the losers in silico — stop paying the platforms to A/B test for you. Almost nobody else offers this.',
    metric: { value: '500', label: 'Buyers, before spend' },
    accent: '#C9A84C',
    tool: '/api/phx-growth/tools/pretest',
  },
  {
    id: 'premium-ai-ads',
    no: '03',
    name: 'Premium AI Ads',
    category: 'Creative',
    headline: 'Scroll-stopping ads, written and rendered in minutes.',
    body: 'Give PHX Growth a product and an angle. It writes platform-native ad copy — hooks, primary text, headlines, CTAs — clears it through policy pre-flight, and briefs an on-brand visual. A full ad, ready to ship, before fatigue catches your account.',
    edge: 'Copy + compliance + creative in one pass — not a prompt box.',
    metric: { value: '<5min', label: 'Brief → finished ad' },
    accent: '#FF2E9A',
    tool: '/api/phx-growth/tools/ads',
  },
  {
    id: 'website-dev',
    no: '04',
    name: 'Website Creation & Development',
    category: 'Orchestration',
    headline: 'From an idea to a live, on-brand website.',
    body: 'Describe the business. PHX Growth plans the sitemap, writes the copy, and generates a complete, responsive landing page — deploy-ready HTML you own outright. Built to convert the traffic you pay for, not just look good.',
    edge: 'A real, shippable site — sitemap, copy and code — not a template picker.',
    metric: { value: '1', label: 'URL to launch' },
    accent: '#00D4FF',
    tool: '/api/phx-growth/tools/website',
  },
  {
    id: 'zero-to-live',
    no: '05',
    name: 'Zero-to-Live Launch',
    category: 'Autonomy',
    headline: 'The whole flight deck, pointed at your account — flown for you.',
    body: 'Not a sixth tool — the other four, run end to end. Paste one product URL and PHX Growth does the market research, builds the synthetic personas, drafts the channel + budget plan across Meta, Google & TikTok, forges the first creative, and wires tracking. A complete, ready-to-launch flight plan, assembled while agencies are still scheduling the kickoff call.',
    edge: 'The done-for-you flight: every service above, orchestrated into one launch.',
    metric: { value: '<60min', label: 'URL → launch plan' },
    accent: '#00D4FF',
    tool: '/api/phx-growth/tools/launch-plan',
  },
];

export function getService(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}
