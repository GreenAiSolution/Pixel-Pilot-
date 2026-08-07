// ─── CLIENT BRAIN · EXAMPLE TENANT (PHX Growth) ─────────────────────────────
// PHX Growth is a WORKED EXAMPLE of a fully-populated Client Brain — not the
// system's default (that's the UNCONFIGURED placeholder in _default.ts). It shows
// every field filled with real, coherent values, and it lets PHX Growth run its
// own marketing by setting CLIENT_ID=phx-growth. Because the live site's data
// (pricing, services) is imported here rather than re-typed, this example can
// never drift from what that site actually sells.
//
// To run the OS for ANY OTHER business: copy TEMPLATE.ts, fill it in, register it
// in index.ts, and set CLIENT_ID. The fleet then runs that business — it has no
// attachment to PHX Growth beyond this one example entry.

import { TIERS, SERVICE_PRICING } from '../pricing';
import { gate, type ClientBrain } from './types';

export const PHX_GROWTH: ClientBrain = {
  id: 'phx-growth',
  name: 'PHX Growth',
  vendor: 'PHX Growth',

  brand: {
    name: 'PHX Growth',
    tagline: 'The autonomous media buyer that flies your ad spend to profit.',
    valueProp:
      'Not a dashboard — an autonomous media buyer across Meta / Google / TikTok that optimizes to real profit, 24/7.',
    voice: 'Confident, specific, a little contrarian. Sell the outcome, never the tool.',
    palette: ['#00D4FF', '#6C63FF', '#FF2E9A', '#C9A84C'], // cyan → violet → magenta, gold accent
    motif: 'Aviation / flight — squadron, flight plan, war room, to profit.',
    claimsPolicy:
      'Defensible, representative outcomes only. Regulated niches served — never promise guaranteed returns.',
  },

  buyers: [
    {
      type: 'DTC founder / growth lead',
      context: '$50k–$1M+/mo in paid media',
      verticals: ['apparel', 'beauty', 'supplements', 'home', 'DTC ecommerce'],
    },
    { type: 'performance agency', context: 'managing multiple brands', verticals: ['agency'] },
    { type: 'in-house media buyer', context: 'scaling an established account', verticals: ['ecommerce'] },
  ],

  compliance: 'ordinary-commerce', // brand serves regulated niches → agents clamp per-launch

  offer: {
    tiers: TIERS,                 // Pilot $2,500 / Squadron $6,000 / Fleet Command $15,000
    services: SERVICE_PRICING,    // Zero-to-Live Plan, Brand Identity Kit, etc.
    pricingModule: 'phx-growth/pricing.ts',
  },

  connectors: {
    zapier: true,
    gmail: true,
    calendar: true,
    slack: true,
    billing: true, // QuickBooks via Zapier
    crm: true,     // Orbital CRM (phx-growth/crm.ts)
    creativeGen: true, // Higgsfield
    adPlatforms: ['meta', 'google', 'tiktok'],
    profitSource: 'shopify',
  },

  autonomy: {
    // All default SAFE. Flip on per-tenant via env as trust builds.
    marketingAutoPublish: gate('PP_AUTOPUBLISH', false),
    emailAutoSend: gate('PP_EMAIL_AUTOSEND', false),
    coldEmailAutoSend: gate('PP_COLD_AUTOSEND', false),
    codeAutoMergeMain: gate('PP_AUTOMERGE_MAIN', false),
    billingAutoSendInvoices: gate('PP_BILLING_AUTOSEND', false),
    billingAutoDunning: gate('PP_BILLING_AUTODUNNING', false),
    mediaMaxDailyBudgetShiftPct: Number(process.env.PP_MEDIA_MAX_SHIFT_PCT ?? 20),
    mediaApprovalAbovePct: Number(process.env.PP_MEDIA_APPROVAL_ABOVE_PCT ?? 20),
  },

  workspace: {
    reportChannel: '#phx-growth',
    durableLogDir: 'out/',
    crmModule: 'phx-growth/crm.ts',
    dailyReportTime: '18:00',
  },

  platform: {
    repo: 'GreenAiSolution/PHX-Growth-',
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
