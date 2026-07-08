---
tags: [pixel-pilot, source]
file: pixel-pilot/tools.ts
---

# `pixel-pilot/tools.ts`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/pixel-pilot/tools.ts`

````ts
// ─── PIXEL PILOT · TOOL SYSTEM ───────────────────────────────────────────────
// The shared registry behind the Studio, pricing cards, service CTAs and stack
// links. If a button claims to open a tool, it should resolve through this file.

export type StudioToolId =
  | 'launch'
  | 'brand'
  | 'funnel'
  | 'website'
  | 'ads'
  | 'content'
  | 'pretest'
  | 'employees';

export type StudioToolCategory = 'Strategy' | 'Build' | 'Optimize';

export interface StudioToolDefinition {
  readonly id: StudioToolId;
  readonly name: string;
  readonly category: StudioToolCategory;
  readonly endpoint: string;
  readonly accent: string;
  readonly icon: string;
  readonly blurb: string;
  readonly cta: string;
  readonly promise: string;
  readonly agentCommand: string;
  readonly qualityChecks: readonly string[];
}

export const STUDIO_TOOLS: readonly StudioToolDefinition[] = [
  {
    id: 'launch',
    name: 'Zero-to-Live Plan',
    category: 'Strategy',
    endpoint: '/api/pixel-pilot/tools/launch-plan',
    accent: '#00D4FF',
    icon: '◎',
    blurb: 'A product or URL -> a complete, profit-first launch plan.',
    cta: 'Build the launch plan',
    promise: 'Research, personas, channel split, creative concepts and tracking checklist.',
    agentCommand: 'pixel-growth-strategist',
    qualityChecks: ['Names the buyer and offer', 'Splits budget across channels', 'Includes tracking and profit ground truth'],
  },
  {
    id: 'brand',
    name: 'Brand Identity Kit',
    category: 'Strategy',
    endpoint: '/api/pixel-pilot/tools/brand',
    accent: '#C9A84C',
    icon: '❖',
    blurb: 'Name, tagline, positioning, a real color system + voice.',
    cta: 'Design the brand',
    promise: 'A usable identity system, not a loose mood board.',
    agentCommand: 'pixel-growth-strategist',
    qualityChecks: ['Ownable position', 'Hex palette with roles', 'Voice rules a team can follow'],
  },
  {
    id: 'funnel',
    name: 'Offer & Funnel Architect',
    category: 'Strategy',
    endpoint: '/api/pixel-pilot/tools/funnel',
    accent: '#6C63FF',
    icon: '⧉',
    blurb: 'An irresistible offer — value stack, tiers, guarantee, funnel.',
    cta: 'Architect the offer',
    promise: 'Offer economics, risk reversal and funnel path in one pass.',
    agentCommand: 'pixel-growth-strategist',
    qualityChecks: ['Clear dream outcome', 'Three coherent tiers', 'No unsupported earnings claims'],
  },
  {
    id: 'website',
    name: 'Website Creation',
    category: 'Build',
    endpoint: '/api/pixel-pilot/tools/website',
    accent: '#00D4FF',
    icon: '▤',
    blurb: 'A complete, responsive, deploy-ready landing page — live.',
    cta: 'Generate the site',
    promise: 'A live hosted URL plus the generated HTML.',
    agentCommand: 'pixel-automation-engineer',
    qualityChecks: ['Complete HTML document', 'Primary CTA has a real target', 'Deploys to /sites/[slug]'],
  },
  {
    id: 'ads',
    name: 'Premium AI Ads',
    category: 'Build',
    endpoint: '/api/pixel-pilot/tools/ads',
    accent: '#FF2E9A',
    icon: '✦',
    blurb: 'Ad copy + compliance + a visual brief, in one pass.',
    cta: 'Write the ad',
    promise: 'Platform-native copy screened before launch.',
    agentCommand: 'pixel-creative-director',
    qualityChecks: ['Hook is specific', 'CTA is usable', 'Compliance verdict is explicit'],
  },
  {
    id: 'content',
    name: 'Content Engine',
    category: 'Build',
    endpoint: '/api/pixel-pilot/tools/content',
    accent: '#FF2E9A',
    icon: '◈',
    blurb: 'A ready-to-post content calendar — hook, caption, CTA per day.',
    cta: 'Fill the calendar',
    promise: 'A publishable content calendar with captions and CTAs.',
    agentCommand: 'pixel-creative-director',
    qualityChecks: ['Exact requested length', 'Platform-native formats', 'CTA on every post'],
  },
  {
    id: 'pretest',
    name: 'Synthetic Pre-Testing',
    category: 'Optimize',
    endpoint: '/api/pixel-pilot/tools/pretest',
    accent: '#C9A84C',
    icon: '◉',
    blurb: 'Score ad variants on synthetic buyers before you spend.',
    cta: 'Run the pre-test',
    promise: 'Ranked launch / iterate / kill verdicts before budget is spent.',
    agentCommand: 'pixel-profit-analyst',
    qualityChecks: ['Requires at least one variant', 'Scores are discriminating', 'Explains why each variant wins or fails'],
  },
  {
    id: 'employees',
    name: 'AI Employees',
    category: 'Optimize',
    endpoint: '/api/pixel-pilot/tools/employees',
    accent: '#6C63FF',
    icon: '❈',
    blurb: 'Hire a crew of AI operators + a first-week deployment plan.',
    cta: 'Hire the crew',
    promise: 'A staffed operator crew and first-week cadence.',
    agentCommand: 'pixel-ops-commander',
    qualityChecks: ['Uses the real Pixel agent roster', 'Names cadence and owner channel', 'Stages risky work for approval'],
  },
] as const;

export const STUDIO_TOOL_FLOW: readonly StudioToolId[] = ['launch', 'brand', 'funnel', 'website', 'ads', 'content', 'pretest', 'employees'];

export const SERVICE_TO_STUDIO_TOOL: Record<string, StudioToolId> = {
  'premium-ai-ads': 'ads',
  'ai-employees': 'employees',
  'website-dev': 'website',
  'synthetic-pretest': 'pretest',
  'zero-to-live': 'launch',
};

export function getStudioTool(id: string): StudioToolDefinition | undefined {
  return STUDIO_TOOLS.find((tool) => tool.id === id);
}

export function studioHref(toolId: StudioToolId, params?: Record<string, string | undefined>): string {
  const search = new URLSearchParams({ tool: toolId });
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value) search.set(key, value);
  }
  return `/studio?${search.toString()}`;
}

export function serviceStudioHref(serviceId: string): string {
  return studioHref(SERVICE_TO_STUDIO_TOOL[serviceId] ?? 'launch');
}
````
