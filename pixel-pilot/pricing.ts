// ─── PIXEL PILOT · PRICING ───────────────────────────────────────────────────
// This is not a cheap tool — it is a media-buying department that never sleeps.
// Premium, retainer + performance. Priced against the media buyer you would hire,
// not the SaaS you would cancel.

export interface Tier {
  readonly id: string;
  readonly name: string;
  readonly price: number; // monthly retainer, USD
  readonly performance: string; // performance component
  readonly tagline: string;
  readonly forWho: string;
  readonly adSpend: string;
  readonly includes: string[];
  readonly accent: string;
  readonly border: string;
  readonly featured?: boolean;
  readonly apex?: boolean;
}

export const TIERS: Tier[] = [
  {
    id: 'PILOT',
    name: 'Pilot',
    price: 2500,
    performance: '+ 8% of ad spend',
    tagline: 'One channel, fully flown',
    forWho: 'Brands scaling their first paid channel',
    adSpend: 'Up to $50k/mo managed',
    includes: [
      'Autonomous buyer on 1 channel',
      'Creative Forge + Genome Lab',
      'Profit-based optimization',
      'Slack war room',
    ],
    accent: 'from-secondary/60 to-secondary/0',
    border: 'border-secondary/30',
  },
  {
    id: 'SQUADRON',
    name: 'Squadron',
    price: 6000,
    performance: '+ 6% of ad spend',
    tagline: 'The full media mix, conducted',
    forWho: 'Growth brands across Meta, Google & TikTok',
    adSpend: 'Up to $250k/mo managed',
    includes: [
      'Cross-Channel Conductor',
      'Synthetic Arena pre-testing',
      'Attribution Truth Engine',
      'All n8n automations',
      'Impression-level creative',
    ],
    accent: 'from-primary/70 to-secondary/30',
    border: 'border-primary/40',
    featured: true,
  },
  {
    id: 'FLEET',
    name: 'Fleet Command',
    price: 15000,
    performance: '+ 4% of ad spend',
    tagline: 'No ceiling. Your own air force.',
    forWho: 'Category leaders & regulated scale',
    adSpend: 'Unlimited spend managed',
    includes: [
      'Everything in Squadron',
      'Compliance-Safe Autopilot',
      'Private data flywheel + model',
      'Dedicated flight director',
      'White-label for agencies',
    ],
    accent: 'from-gold/70 to-accent/30',
    border: 'border-gold/40',
    apex: true,
  },
];

// ─── À LA CARTE SERVICES ─────────────────────────────────────────────────────
// Every Studio deliverable, priced on its own. Retainers above are for a fully-
// managed account; these are for teams who want a specific product built fast.
// Prices are the single source of truth — edit here, they propagate to the
// Pricing page. (Adjust freely; these are set to premium, defensible anchors.)

export interface ServicePrice {
  readonly id: string;
  readonly name: string;
  readonly price: string; // display price, e.g. "$1,500"
  readonly unit: string; // "one-time" | "/mo" | "/batch"
  readonly from?: boolean; // show a "from" prefix
  readonly tagline: string;
  readonly includes: string[];
  readonly accent: string;
  readonly tool: string; // deep-link into the live Studio tool
  readonly popular?: boolean;
}

export const SERVICE_PRICING: ServicePrice[] = [
  {
    id: 'launch',
    name: 'Zero-to-Live Plan',
    price: '$1,500',
    unit: 'one-time',
    tagline: 'A product or URL → a complete, profit-first launch plan.',
    includes: ['Market + competitor research', 'Synthetic buyer personas', 'Channel & budget split', 'Creative concepts + tracking plan'],
    accent: '#00D4FF',
    tool: '/studio?tool=launch',
  },
  {
    id: 'brand',
    name: 'Brand Identity Kit',
    price: '$1,200',
    unit: 'one-time',
    tagline: 'Name, tagline, positioning, a real color system + voice.',
    includes: ['Name + tagline + positioning', 'Full color system (hex)', 'Type + voice principles', 'Do / don’t brand rules'],
    accent: '#C9A84C',
    tool: '/studio?tool=brand',
  },
  {
    id: 'funnel',
    name: 'Offer & Funnel Architect',
    price: '$900',
    unit: 'one-time',
    tagline: 'An irresistible offer — value stack, tiers, guarantee, funnel.',
    includes: ['Core promise + value stack', '3 pricing tiers', 'Risk-reversal guarantee', 'Full funnel + upsell map'],
    accent: '#6C63FF',
    tool: '/studio?tool=funnel',
  },
  {
    id: 'website',
    name: 'Website Creation',
    price: '$2,500',
    unit: 'one-time',
    from: true,
    tagline: 'A complete, responsive, deploy-ready landing page — live.',
    includes: ['Sitemap + conversion copy', 'Responsive, accessible build', 'Deployed to a live URL', 'You own the code'],
    accent: '#00D4FF',
    tool: '/studio?tool=website',
    popular: true,
  },
  {
    id: 'ads',
    name: 'Premium AI Ads',
    price: '$1,500',
    unit: '/mo',
    from: true,
    tagline: 'Scroll-stopping ad copy + compliance + a visual brief.',
    includes: ['Platform-native copy sets', 'Policy compliance screen', 'On-brand visual briefs', 'Fresh creative on demand'],
    accent: '#FF2E9A',
    tool: '/studio?tool=ads',
  },
  {
    id: 'content',
    name: 'Content Engine',
    price: '$1,200',
    unit: '/mo',
    tagline: 'A ready-to-post content calendar — hook, caption, CTA per day.',
    includes: ['Up to 14-day calendars', 'Hook + caption + format', 'Platform-native voice', 'Hashtag sets'],
    accent: '#FF2E9A',
    tool: '/studio?tool=content',
  },
  {
    id: 'pretest',
    name: 'Synthetic Pre-Testing',
    price: '$400',
    unit: '/batch',
    tagline: 'Score ad variants on synthetic buyers before you spend.',
    includes: ['Synthetic buyer personas', 'Scroll-stop + clarity scores', 'Launch / iterate / kill verdicts', 'Ranked best-first'],
    accent: '#C9A84C',
    tool: '/studio?tool=pretest',
  },
  {
    id: 'employees',
    name: 'AI Employees',
    price: '$2,000',
    unit: '/mo',
    from: true,
    tagline: 'Hire a crew of AI operators + a first-week deployment plan.',
    includes: ['Specialist agent crew', 'First-week deployment plan', 'Lives in your Slack', 'Works 24/7'],
    accent: '#6C63FF',
    tool: '/studio?tool=employees',
  },
];
