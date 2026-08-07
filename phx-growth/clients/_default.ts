// ─── CLIENT BRAIN · UNCONFIGURED DEFAULT ────────────────────────────────────
// This is what the Autonomous Growth OS runs out of the box, before it has been
// pointed at a real business. It is deliberately empty and SAFE: no brand, no
// offer, no connectors, no autonomy. Every agent detects it (isConfigured() ===
// false) and STOPS — directing the operator to stamp a real Client Brain instead
// of guessing or defaulting to someone else's business.
//
// The system is therefore "ready for any business" but tied to none. To activate
// it, copy TEMPLATE.ts to <client-slug>.ts, register it in index.ts, and set
// CLIENT_ID=<client-slug>.

import { UNCONFIGURED_ID, type ClientBrain } from './types';

export const UNCONFIGURED: ClientBrain = {
  id: UNCONFIGURED_ID,
  name: 'Unconfigured Business',
  vendor: 'PHX Growth', // the operator of the OS; the CLIENT is not yet set

  brand: {
    name: '',
    tagline: '',
    valueProp: '',
    voice: '',
    palette: [],
    motif: '',
    claimsPolicy: 'No claims until a real Client Brain is configured.',
  },

  buyers: [],
  compliance: 'ordinary-commerce',

  offer: { tiers: [], services: [], pricingModule: '' },

  connectors: {
    zapier: false,
    gmail: false,
    calendar: false,
    slack: false,
    billing: false,
    crm: false,
    creativeGen: false,
    adPlatforms: [],
    profitSource: null,
  },

  autonomy: {
    marketingAutoPublish: false,
    emailAutoSend: false,
    coldEmailAutoSend: false,
    codeAutoMergeMain: false,
    billingAutoSendInvoices: false,
    billingAutoDunning: false,
    mediaMaxDailyBudgetShiftPct: 0,
    mediaApprovalAbovePct: 0,
  },

  workspace: {
    reportChannel: '',
    durableLogDir: 'out/',
    crmModule: '',
    dailyReportTime: '18:00',
  },

  platform: {
    repo: null,
    apiBasePath: 'app/api',
    deployTarget: 'vercel',
    brainDir: 'phx-growth/',
  },

  cadence: {
    followUpDays: [0, 2, 5, 10],
    dunningDays: [7, 14, 30],
    winBackQuietDays: 45,
  },
};
