// ─── PIXEL PILOT · SERVICES ──────────────────────────────────────────────────
// The flight deck. FIVE services, each a real tool we build and run — the single
// source of truth for the marketing surface, the 3D orbit, the Automator and the
// pricing matrix. Edit here, it propagates everywhere.
//
// Each service maps to a live tool under app/api/pixel-pilot/tools/* with a
// complete workflow (pixel-pilot/tools.ts). Categories are drawn from the existing
// ServiceCategory set so the automation planner (automations.ts) stays valid.

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
    id: 'premium-ai-ads',
    no: '01',
    name: 'Premium AI Ads',
    category: 'Creative',
    headline: 'Scroll-stopping ads, written and rendered in minutes.',
    body: 'Give Pixel Pilot a product and an angle. It writes platform-native ad copy — hooks, primary text, headlines, CTAs — screens it for policy compliance, and briefs an on-brand visual. A full ad, ready to ship.',
    edge: 'Copy + compliance + creative in one pass — not a prompt box.',
    metric: { value: '<5min', label: 'Brief → finished ad' },
    accent: '#FF2E9A',
    tool: '/api/pixel-pilot/tools/ads',
  },
  {
    id: 'ai-employees',
    no: '02',
    name: 'AI Employees',
    category: 'Autonomy',
    headline: 'Hire a crew of AI operators that never sleep.',
    body: 'Deploy specialized agents — media buyer, profit analyst, creative director, growth strategist — into your business. They live in your Slack, work 24/7, and report back. Onboarding is a conversation, not a contract.',
    edge: 'A roster of specialists, deployed in minutes and working around the clock.',
    metric: { value: '24/7', label: 'On the job' },
    accent: '#6C63FF',
    tool: '/api/pixel-pilot/tools/employees',
  },
  {
    id: 'website-dev',
    no: '03',
    name: 'Website Creation & Development',
    category: 'Orchestration',
    headline: 'From an idea to a live, on-brand website.',
    body: 'Describe the business. Pixel Pilot plans the sitemap, writes the copy, and generates a complete, responsive landing page — deploy-ready HTML you own. Conversion-focused, fast, and built to sell.',
    edge: 'A real, shippable site — sitemap, copy and code — not a template picker.',
    metric: { value: '1', label: 'URL to launch' },
    accent: '#00D4FF',
    tool: '/api/pixel-pilot/tools/website',
  },
  {
    id: 'synthetic-pretest',
    no: '04',
    name: 'Synthetic Ad Pre-Testing',
    category: 'Intelligence',
    headline: 'Test your ads on 500 buyers before you spend $1.',
    body: 'Pixel Pilot builds synthetic buyer personas from your customer profile, then scores every ad variant against them — predicting scroll-stop, clarity and click intent. Launch only the predicted winners.',
    edge: 'Kill the losers in silico — stop paying the platforms to A/B test for you.',
    metric: { value: '500', label: 'Buyers, before spend' },
    accent: '#C9A84C',
    tool: '/api/pixel-pilot/tools/pretest',
  },
  {
    id: 'zero-to-live',
    no: '05',
    name: 'Zero-to-Live Launch',
    category: 'Autonomy',
    headline: 'Point it at a URL. Get a complete launch plan back.',
    body: 'From one product URL: market research, synthetic personas, a channel + budget plan across Meta, Google & TikTok, first creative concepts, and a tracking checklist. The whole flight plan, autonomously assembled.',
    edge: 'Market research to a ready-to-launch plan while your coffee brews.',
    metric: { value: '<60min', label: 'URL → launch plan' },
    accent: '#00D4FF',
    tool: '/api/pixel-pilot/tools/launch-plan',
  },
];

export function getService(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}
