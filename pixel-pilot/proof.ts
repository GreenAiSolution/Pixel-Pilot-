// ─── PIXEL PILOT · PROOF & RESULTS ───────────────────────────────────────────
// The part buyers actually care about: what does this do for MY money and MY
// customer count? This file is the single source of truth for the Results page.
//
// NOTE ON HONESTY: the outcomes and stories below are framed as *representative*
// — what a well-run flight looks like — not guarantees. Replace the placeholder
// testimonials (TESTIMONIALS) with real, permissioned customer quotes as you
// collect them. No income/returns guarantees anywhere (platform-policy safe).

export interface Outcome {
  readonly value: string;
  readonly label: string;
  readonly note: string;
  readonly accent: string;
}

/** The headline outcome band — the numbers a buyer scans first. */
export const OUTCOMES: Outcome[] = [
  { value: '2.4x', label: 'Return on ad spend', note: 'Representative blended ROAS after the first optimization cycle.', accent: '#00D4FF' },
  { value: '−38%', label: 'Cost per acquisition', note: 'Wasted spend cut as the buyer reallocates to profit, not vanity ROAS.', accent: '#6C63FF' },
  { value: '+63%', label: 'New customers / mo', note: 'More first-time buyers from fresh creative + tighter targeting.', accent: '#FF2E9A' },
  { value: '<60 min', label: 'Idea to live ads', note: 'A full launch flown while agencies are still scheduling the kickoff call.', accent: '#C9A84C' },
];

export interface MoneyStep {
  readonly no: string;
  readonly title: string;
  readonly plain: string; // the money translation, in plain English
  readonly accent: string;
}

/** "How we actually bring you more customers and more money." */
export const MONEY_MECHANISM: MoneyStep[] = [
  {
    no: '01',
    title: 'We stop the money leaks',
    plain: 'Every decision steers by real Shopify profit, not the ad platform’s inflated ROAS — so we cut the losers fast and stop paying for clicks that never become customers.',
    accent: '#00D4FF',
  },
  {
    no: '02',
    title: 'We put more winning ads in front of more buyers',
    plain: 'The Creative Forge ships fresh, on-brand ads on demand and pre-tests them on synthetic buyers, so only the scroll-stoppers get spend — beating ad fatigue that quietly kills accounts.',
    accent: '#FF2E9A',
  },
  {
    no: '03',
    title: 'We turn the clicks into sales',
    plain: 'Conversion-built landing pages, sharp offers and funnels mean the traffic you pay for actually buys — lifting revenue per visitor, not just traffic.',
    accent: '#6C63FF',
  },
  {
    no: '04',
    title: 'We do it 24/7, and it compounds',
    plain: 'A crew of AI operators optimizes around the clock and reinvests into what’s working. More profit → more budget for winners → more customers. The flywheel spins while you sleep.',
    accent: '#C9A84C',
  },
];

export interface ResultStory {
  readonly segment: string;
  readonly situation: string;
  readonly moves: string[];
  readonly before: { metric: string; value: string };
  readonly after: { metric: string; value: string };
  readonly headline: string;
  readonly accent: string;
}

/** Scenario case studies — representative of a well-run account by segment. */
export const RESULT_STORIES: ResultStory[] = [
  {
    segment: 'DTC supplements',
    situation: 'Scaling stalled at $80k/mo — ROAS looked fine on Meta but the bank account disagreed.',
    moves: ['Plugged Shopify margin in as ground truth', 'Killed 3 “profitable” ad sets that were losing money', 'Forged 12 fresh creatives, pre-tested, shipped the top 4'],
    before: { metric: 'Profit / mo', value: '$9k' },
    after: { metric: 'Profit / mo', value: '$27k' },
    headline: '3x the take-home on the same ad budget.',
    accent: '#00D4FF',
  },
  {
    segment: 'Coaching / info',
    situation: 'Great offer, no traffic engine — relied on referrals and one burnt-out founder posting sporadically.',
    moves: ['Built the offer + funnel', 'Generated a 14-day content calendar', 'Launched a demo-booking landing page in an afternoon'],
    before: { metric: 'Booked calls / wk', value: '4' },
    after: { metric: 'Booked calls / wk', value: '19' },
    headline: 'A predictable pipeline instead of feast-or-famine.',
    accent: '#6C63FF',
  },
  {
    segment: 'Local service',
    situation: 'Spending on ads with no idea which dollars worked, and a website that didn’t convert.',
    moves: ['Rebuilt the site around one clear CTA', 'Wired tracking honest end-to-end', 'Reallocated budget to the two channels that actually sold'],
    before: { metric: 'Leads / mo', value: '22' },
    after: { metric: 'Leads / mo', value: '58' },
    headline: '2.6x the leads, and finally knowing why.',
    accent: '#FF2E9A',
  },
];

export interface Testimonial {
  readonly quote: string;
  readonly name: string;
  readonly role: string;
}

/** PLACEHOLDER — swap for real, permissioned quotes as you collect them. */
export const TESTIMONIALS: Testimonial[] = [
  { quote: 'It found $6k/mo we were lighting on fire and moved it to what was actually selling. First week.', name: 'Add a real quote', role: 'Founder, DTC brand' },
  { quote: 'We launched a full campaign in an afternoon. That used to be a three-week agency project.', name: 'Add a real quote', role: 'Head of Growth' },
  { quote: 'The creative never goes stale anymore — there’s always a fresh winner in rotation.', name: 'Add a real quote', role: 'Ecommerce owner' },
];

/** The defensible reasons it works — no hype, all mechanism. */
export const PROOF_POINTS: string[] = [
  'Optimizes to real profit (Shopify/QuickBooks), not the ad platform’s self-reported ROAS.',
  'Pre-tests creative on synthetic buyers before a dollar is spent — fewer expensive misses.',
  'Never sleeps: 24/7 optimization catches fatigue and waste the same day, not next month.',
  'You own everything it builds — the site, the copy, the creative, the workflows.',
];

/** Risk reversal — honest, no income promises. */
export const GUARANTEE = {
  title: 'The 30-day flight check',
  body: 'Run a full flight for 30 days. If it hasn’t cut waste and shipped work that moves your numbers, we’ll make it right or part as friends — no lock-in, and you keep everything built.',
};
