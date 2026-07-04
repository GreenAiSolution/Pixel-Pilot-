// ─── EAGLE LANDSCAPING · THE 5 AI EMPLOYEES ──────────────────────────────────
// "Eagle Ops" — five specialized AI employees that run the business in and out.
// Each maps to a Claude Code subagent (command it by name), a set of n8n
// workflows (see workflows.ts), and the apps it operates through (QuickBooks via
// Zapier, Slack, Gmail, Google Sheets/Calendar). Single source of truth for the
// Mission Control dashboard.

export interface EagleAgent {
  readonly id: string;
  readonly name: string; // the "employee" name
  readonly role: string; // job title
  readonly emoji: string;
  readonly tagline: string;
  readonly specialty: string;
  readonly responsibilities: string[];
  /** Apps it operates through. */
  readonly integrations: string[];
  /** The numbers it moves. */
  readonly kpis: { label: string; value: string }[];
  readonly cadence: string;
  /** Claude Code subagent name — how you command it. */
  readonly command: string;
  readonly accent: string;
}

export const EAGLE_AGENTS: EagleAgent[] = [
  {
    id: 'sales-closer',
    name: 'Rowan',
    role: 'Sales Closer',
    emoji: '🎯',
    tagline: 'No lead goes cold.',
    specialty: 'Lead capture, qualification, estimates & follow-up until the job is won.',
    responsibilities: [
      'Catch every lead from the site, calls and forms within seconds',
      'Qualify by service, size, budget and urgency',
      'Book on-site estimates and send instant quotes',
      'Follow up on a cadence until the client says yes or no',
      'Hand won jobs to Dispatch and Billing automatically',
    ],
    integrations: ['Website forms', 'Gmail', 'SMS', 'Google Calendar', 'Slack'],
    kpis: [
      { label: 'Lead response', value: '< 60s' },
      { label: 'Speed-to-quote', value: '< 10 min' },
      { label: 'Follow-ups', value: 'Auto' },
    ],
    cadence: 'Real-time + hourly sweep',
    command: 'eagle-sales-closer',
    accent: '#3FA34D',
  },
  {
    id: 'dispatch',
    name: 'Sage',
    role: 'Dispatch & Scheduling',
    emoji: '🗺️',
    tagline: 'Right crew, right yard, right time.',
    specialty: 'Crew scheduling, route optimization and weather-aware rebooking.',
    responsibilities: [
      'Schedule won jobs to the right crew and day',
      'Optimize daily routes to cut windshield time',
      'Watch the forecast and rebook rained-out jobs automatically',
      'Text clients and crews arrival windows and reminders',
      'Keep the calendar and job board always current',
    ],
    integrations: ['Google Calendar', 'Weather API', 'SMS', 'Google Maps', 'Slack'],
    kpis: [
      { label: 'Route time saved', value: '~22%' },
      { label: 'No-shows', value: '↓' },
      { label: 'Rebooking', value: 'Auto' },
    ],
    cadence: 'Daily 5:30am + on weather change',
    command: 'eagle-dispatch',
    accent: '#1E7A46',
  },
  {
    id: 'billing',
    name: 'Quill',
    role: 'Billing & QuickBooks',
    emoji: '🧾',
    tagline: 'Money in, books clean.',
    specialty: 'Estimates, invoices, payments and AR — straight into QuickBooks (via Zapier).',
    responsibilities: [
      'Turn won jobs into QuickBooks customers & estimates',
      'Invoice automatically when a job is marked complete',
      'Send payment links and chase overdue balances (AR)',
      'Reconcile payments and flag anomalies',
      'Post a daily cash + AR summary to Slack',
    ],
    integrations: ['QuickBooks Online (via Zapier)', 'Gmail', 'Stripe/payments', 'Slack'],
    kpis: [
      { label: 'Days to invoice', value: '0' },
      { label: 'AR chased', value: 'Auto' },
      { label: 'Booked to QB', value: 'Live' },
    ],
    cadence: 'On job complete + daily 6pm',
    command: 'eagle-billing',
    accent: '#D8A93B',
  },
  {
    id: 'growth',
    name: 'Marlo',
    role: 'Growth & Marketing',
    emoji: '📣',
    tagline: 'Keeps the pipeline full.',
    specialty: 'Local SEO, Google Business, reviews and seasonal ad & social pushes.',
    responsibilities: [
      'Run the Google Business Profile and post weekly',
      'Generate review requests after every completed job',
      'Publish seasonal offers (spring cleanup, snow, aeration)',
      'Render before/after video ads + reels (HyperFrames) and brand stills (Gemini)',
      'Draft & schedule local social + neighborhood ads',
      'Track leads by source and double down on winners',
    ],
    integrations: ['Google Business', 'Meta/Google Ads', 'HyperFrames (video)', 'Gemini (stills)', 'Gmail', 'Slack'],
    kpis: [
      { label: 'New reviews', value: '↑' },
      { label: 'Local rank', value: 'Tracked' },
      { label: 'Cost / lead', value: 'Down' },
    ],
    cadence: 'Daily 8am',
    command: 'eagle-growth',
    accent: '#6BA368',
  },
  {
    id: 'client-care',
    name: 'Wren',
    role: 'Client Care & Retention',
    emoji: '🤝',
    tagline: 'Turns jobs into regulars.',
    specialty: 'Post-job follow-up, review asks, seasonal upsells and win-backs.',
    responsibilities: [
      'Follow up after every job to confirm satisfaction',
      'Ask happy clients for reviews & referrals',
      'Offer the right seasonal upsell at the right time',
      'Reactivate lapsed clients before a competitor does',
      'Escalate any unhappy client to a human instantly',
    ],
    integrations: ['Gmail', 'SMS', 'Google Sheets', 'Slack'],
    kpis: [
      { label: 'Repeat rate', value: '↑' },
      { label: 'Referrals', value: 'Auto-ask' },
      { label: 'Win-backs', value: 'Monthly' },
    ],
    cadence: 'Daily 4pm',
    command: 'eagle-client-care',
    accent: '#8B5E34',
  },
];

export function getEagleAgent(id: string): EagleAgent | undefined {
  return EAGLE_AGENTS.find((a) => a.id === id);
}
