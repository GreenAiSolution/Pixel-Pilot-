// ─── CLIENT BRAIN · NEW TENANT TEMPLATE ─────────────────────────────────────
// Copy this file to `<client-slug>.ts`, fill every field, register it in
// index.ts, then set CLIENT_ID=<client-slug>. That is a full OS install — the
// entire agent fleet now operates that business instead of PHX Growth.
//
// Rules of thumb:
//   • Leave a connector `false` until it is actually wired. Agents degrade to
//     "draft + stage" automatically when a connector is dark — they never fake it.
//   • Keep every autonomy gate default-SAFE (false / conservative). Turn them up
//     per-tenant via env as the client learns to trust the system.
//   • Set `compliance` honestly — it directly controls how hard the Compliance
//     agent clamps claims before anything launches.

import { gate, type ClientBrain } from './types';

export const CLIENT: ClientBrain = {
  id: 'client-slug',            // must match CLIENT_ID
  name: 'Client Business Name',
  vendor: 'PHX Growth',         // white-label operator

  brand: {
    name: 'Client Business Name',
    tagline: 'One-line promise.',
    valueProp: 'What the business actually sells, in one sentence.',
    voice: 'Tone rules for all copy.',
    palette: ['#000000', '#FFFFFF'], // brand hex, most prominent first
    motif: 'Recurring visual/metaphor system, if any.',
    claimsPolicy: 'Defensible ranges, no guarantees. Tighten for regulated niches.',
  },

  buyers: [
    { type: 'Primary buyer', context: 'Qualifying context', verticals: ['vertical'] },
  ],

  compliance: 'ordinary-commerce', // or supplements | medical | financial | crypto | ...

  offer: {
    tiers: [],    // import the client's pricing module, or define tiers inline
    services: [],
    pricingModule: 'phx-growth/clients/<client-slug>-pricing.ts',
  },

  connectors: {
    zapier: false,
    gmail: false,
    calendar: false,
    slack: false,
    billing: false,
    crm: false,
    creativeGen: false,
    adPlatforms: [],           // ['meta','google','tiktok'] as they go live
    profitSource: null,        // 'shopify' | 'quickbooks' | null
  },

  autonomy: {
    marketingAutoPublish: gate('CLIENT_AUTOPUBLISH', false),
    emailAutoSend: gate('CLIENT_EMAIL_AUTOSEND', false),
    coldEmailAutoSend: gate('CLIENT_COLD_AUTOSEND', false),
    codeAutoMergeMain: gate('CLIENT_AUTOMERGE_MAIN', false),
    billingAutoSendInvoices: gate('CLIENT_BILLING_AUTOSEND', false),
    billingAutoDunning: gate('CLIENT_BILLING_AUTODUNNING', false),
    mediaMaxDailyBudgetShiftPct: Number(process.env.CLIENT_MEDIA_MAX_SHIFT_PCT ?? 15),
    mediaApprovalAbovePct: Number(process.env.CLIENT_MEDIA_APPROVAL_ABOVE_PCT ?? 15),
  },

  workspace: {
    reportChannel: '#client-warroom',
    durableLogDir: 'out/',
    crmModule: 'phx-growth/crm.ts',
    dailyReportTime: '18:00',
  },

  platform: {
    repo: null,                 // set if the client's product lives in a repo
    apiBasePath: 'app/api/phx-growth',
    deployTarget: 'vercel',
    brainDir: 'phx-growth/',
  },

  cadence: {
    followUpDays: [0, 2, 5, 10],
    dunningDays: [7, 14, 30],
    winBackQuietDays: 45,
  },
};
