// ─── PHX GROWTH AGENTIC · PRICING ────────────────────────────────────────────
// The single source of truth for money. The marketing page in
// components/phx/pricing.tsx and the AI-drafted quote email both read from
// here, so a price can never be right in one place and wrong in the other.
//
// Priced against the person you would otherwise hire, not against software.
// One part-time receptionist in Phoenix costs ~$2,400/mo fully loaded and
// covers 24% of the week; Front Office covers all of it for less.
//
// The ladder is deliberately built so cost per employee falls as you climb —
// $899 → $795 → $730 — because the reason to buy up should be arithmetic the
// customer can check, not a badge that says "most popular".

export interface Tier {
  readonly id: string;
  readonly name: string;
  readonly price: number; // monthly, USD
  readonly performance: string; // per-employee economics, shown on the card
  readonly tagline: string;
  readonly forWho: string;
  readonly coverage: string;
  readonly staff: number;
  readonly includes: string[];
  readonly accent: string;
  readonly border: string;
  readonly featured?: boolean;
  readonly apex?: boolean;
}

export const TIERS: Tier[] = [
  {
    id: 'LINE',
    name: 'Line',
    price: 349.99,
    performance: 'no employee — automations only',
    tagline: "Texts back. Doesn't talk.",
    forWho: 'Owners not ready to hand over the phone',
    coverage: 'Text and web only',
    staff: 0,
    includes: [
      'Missed-call text-back within 60 seconds',
      'Web-form replies within 60 seconds',
      'Review request after every completed job',
      'Monthly report with the honest misses',
    ],
    accent: '#7c8996',
    border: 'rgba(124,137,150,0.35)',
  },
  {
    id: 'ANSWER',
    name: 'Answer',
    price: 899,
    performance: '$899 per employee',
    tagline: 'Ivy picks up. Every time.',
    forWho: 'One line, one location, calls going to voicemail',
    coverage: '24/7, one line',
    staff: 1,
    includes: [
      'Every call answered, 24/7 — no voicemail',
      'Books straight onto your calendar',
      'Emergencies escalated to a human in under a minute',
      'Sales calls screened before they reach you',
      'Everything in Line',
    ],
    accent: '#e9eef3',
    border: 'rgba(233,238,243,0.28)',
  },
  {
    id: 'CREW',
    name: 'Crew',
    price: 1590,
    performance: '$795 per employee',
    tagline: 'Ivy answers. Dex runs the day.',
    forWho: 'Shops losing an hour a day to confirmations and reschedules',
    coverage: '24/7, two lines or two locations',
    staff: 2,
    includes: [
      'Ivy + Dex',
      'Morning confirmations, reschedules, on-the-way texts',
      'Two lines or two locations',
      'Everything in Answer',
    ],
    accent: '#4fd1a5',
    border: 'rgba(79,209,165,0.4)',
  },
  {
    id: 'FRONT_OFFICE',
    name: 'Front Office',
    price: 2190,
    performance: '$730 per employee — the best rate on the ladder',
    tagline: 'All three. The whole front desk.',
    forWho: 'Anyone who would otherwise hire a receptionist',
    coverage: '168 hours a week, unlimited lines',
    staff: 3,
    includes: [
      'Ivy + Dex + Rae',
      'Rae works every open quote and dormant customer',
      'Unlimited lines',
      'Named operator and a monthly review call',
      'Everything in Crew',
    ],
    accent: '#ffb44a',
    border: 'rgba(255,180,74,0.5)',
    featured: true,
    apex: true,
  },
];

// What the human alternative actually costs — the anchor used by both the page
// and the drafted quote. Phoenix market, fully loaded (wage + tax + benefits).
export const HUMAN_ANCHOR = {
  role: 'part-time receptionist',
  monthlyLow: 2400,
  monthlyHigh: 3200,
  hoursCovered: 40,
  hoursInWeek: 168,
} as const;

// Add-ons, priced on their own. Deliberately short — a long menu invites
// negotiation, and the ladder above is where the decision should happen.
export interface ServicePrice {
  readonly id: string;
  readonly name: string;
  readonly price: string;
  readonly unit: string;
  readonly from?: boolean;
  readonly tagline: string;
  readonly includes: string[];
  readonly accent: string;
  readonly tool: string;
  readonly popular?: boolean;
}

export const SERVICE_PRICING: ServicePrice[] = [
  {
    id: 'extra-line',
    name: 'Additional line',
    price: '$149',
    unit: '/mo',
    tagline: 'A second number answered by the same employee',
    includes: ['Separate greeting and hours', 'Rolls into the same report'],
    accent: '#4fd1a5',
    tool: 'lead',
  },
  {
    id: 'spanish',
    name: 'Spanish line',
    price: '$199',
    unit: '/mo',
    tagline: 'The same employee, answering in Spanish',
    includes: ['Bilingual greeting and booking', 'Transcripts in both languages'],
    accent: '#ffb44a',
    tool: 'lead',
    popular: true,
  },
  {
    id: 'after-hours-only',
    name: 'After-hours only',
    price: '$549',
    unit: '/mo',
    from: true,
    tagline: 'She covers evenings and weekends; your office keeps the day',
    includes: ['6pm–7am and weekends', 'Emergency escalation included'],
    accent: '#7c8996',
    tool: 'lead',
  },
];
