---
tags: [pixel-pilot, source]
file: eagle/workflows.ts
---

# `eagle/workflows.ts`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/eagle/workflows.ts`

`````ts
// ─── EAGLE LANDSCAPING · n8n WORKFLOWS ───────────────────────────────────────
// The automation spine behind the five agents. Each is a real n8n workflow graph
// (nodes + connections in n8n's export shape) + a webhook path. QuickBooks steps
// run through Zapier so they go live with no Intuit developer app.

export interface EagleNode {
  readonly name: string;
  readonly type: string;
  readonly notes: string;
}

export interface EagleWorkflow {
  readonly id: string;
  readonly name: string;
  readonly agentId: string;
  readonly summary: string;
  readonly trigger: 'webhook' | 'schedule' | 'event';
  readonly cadence: string;
  readonly webhookPath: string;
  readonly nodes: EagleNode[];
  readonly connections: Record<string, string[]>;
}

export const EAGLE_WORKFLOWS: EagleWorkflow[] = [
  {
    id: 'lead-to-quote',
    name: 'Lead → Quote → Booked',
    agentId: 'sales-closer',
    summary:
      'A new lead is captured, qualified, instantly quoted, and an estimate is booked — with automatic follow-ups until it closes.',
    trigger: 'webhook',
    cadence: 'Real-time',
    webhookPath: '/webhook/eagle-lead',
    nodes: [
      { name: 'New Lead', type: 'n8n-nodes-base.webhook', notes: 'Site form / call' },
      { name: 'Qualify + Score', type: 'n8n-nodes-base.code', notes: 'Service, size, urgency' },
      { name: 'Instant Quote', type: 'n8n-nodes-base.code', notes: 'Ballpark from rules' },
      { name: 'Text + Email Lead', type: 'n8n-nodes-base.httpRequest', notes: 'SMS + Gmail' },
      { name: 'Book Estimate', type: 'n8n-nodes-base.googleCalendar', notes: 'Offer slots' },
      { name: 'Follow-up Sequence', type: 'n8n-nodes-base.wait', notes: 'Until won/lost' },
      { name: 'Notify Owner', type: 'n8n-nodes-base.slack', notes: 'Hot lead alert' },
    ],
    connections: {
      'New Lead': ['Qualify + Score'],
      'Qualify + Score': ['Instant Quote'],
      'Instant Quote': ['Text + Email Lead', 'Notify Owner'],
      'Text + Email Lead': ['Book Estimate'],
      'Book Estimate': ['Follow-up Sequence'],
    },
  },
  {
    id: 'daily-dispatch',
    name: 'Weather-Aware Daily Dispatch',
    agentId: 'dispatch',
    summary:
      'Every morning: pull the day’s jobs, check the forecast, optimize routes, rebook rain-outs, and text crews + clients.',
    trigger: 'schedule',
    cadence: 'Daily 5:30am',
    webhookPath: '/webhook/eagle-dispatch',
    nodes: [
      { name: 'Every day 5:30', type: 'n8n-nodes-base.scheduleTrigger', notes: 'Cron' },
      { name: "Pull Today's Jobs", type: 'n8n-nodes-base.googleCalendar', notes: 'Job board' },
      { name: 'Check Forecast', type: 'n8n-nodes-base.httpRequest', notes: 'Weather API' },
      { name: 'Rain? Rebook', type: 'n8n-nodes-base.if', notes: 'Move wet jobs' },
      { name: 'Optimize Routes', type: 'n8n-nodes-base.code', notes: 'Cluster by area' },
      { name: 'Text Crews + Clients', type: 'n8n-nodes-base.httpRequest', notes: 'Windows + reminders' },
      { name: 'Post Run Sheet', type: 'n8n-nodes-base.slack', notes: 'Daily board' },
    ],
    connections: {
      'Every day 5:30': ["Pull Today's Jobs"],
      "Pull Today's Jobs": ['Check Forecast'],
      'Check Forecast': ['Rain? Rebook'],
      'Rain? Rebook': ['Optimize Routes'],
      'Optimize Routes': ['Text Crews + Clients'],
      'Text Crews + Clients': ['Post Run Sheet'],
    },
  },
  {
    id: 'job-to-invoice',
    name: 'Job Complete → QuickBooks Invoice',
    agentId: 'billing',
    summary:
      'When a job is marked complete, create/update the QuickBooks customer, send the invoice + payment link, and start AR follow-up.',
    trigger: 'event',
    cadence: 'On job complete',
    webhookPath: '/webhook/eagle-invoice',
    nodes: [
      { name: 'Job Complete', type: 'n8n-nodes-base.webhook', notes: 'Crew marks done' },
      { name: 'Upsert QB Customer', type: 'n8n-nodes-base.httpRequest', notes: 'QuickBooks via Zapier' },
      { name: 'Create QB Invoice', type: 'n8n-nodes-base.httpRequest', notes: 'QuickBooks via Zapier' },
      { name: 'Send Invoice + Link', type: 'n8n-nodes-base.httpRequest', notes: 'Gmail + pay link' },
      { name: 'AR Follow-up', type: 'n8n-nodes-base.wait', notes: 'Chase at 7/14/30d' },
      { name: 'Daily Cash Summary', type: 'n8n-nodes-base.slack', notes: 'Paid + overdue' },
    ],
    connections: {
      'Job Complete': ['Upsert QB Customer'],
      'Upsert QB Customer': ['Create QB Invoice'],
      'Create QB Invoice': ['Send Invoice + Link'],
      'Send Invoice + Link': ['AR Follow-up'],
      'AR Follow-up': ['Daily Cash Summary'],
    },
  },
  {
    id: 'review-and-reviews',
    name: 'Reviews + Local Growth Engine',
    agentId: 'growth',
    summary:
      'Post to Google Business, request reviews after completed jobs, publish the seasonal offer, and track leads by source.',
    trigger: 'schedule',
    cadence: 'Daily 8am',
    webhookPath: '/webhook/eagle-growth',
    nodes: [
      { name: 'Every day 8am', type: 'n8n-nodes-base.scheduleTrigger', notes: 'Cron' },
      { name: 'Completed Jobs', type: 'n8n-nodes-base.googleSheets', notes: 'Yesterday' },
      { name: 'Request Reviews', type: 'n8n-nodes-base.httpRequest', notes: 'SMS + email' },
      { name: 'GBP Post', type: 'n8n-nodes-base.httpRequest', notes: 'Google Business' },
      { name: 'Render Video Ad', type: 'n8n-nodes-base.httpRequest', notes: 'HyperFrames before/after reel' },
      { name: 'Seasonal Offer', type: 'n8n-nodes-base.code', notes: 'Right offer, right month' },
      { name: 'Source Report', type: 'n8n-nodes-base.slack', notes: 'CPL by channel' },
    ],
    connections: {
      'Every day 8am': ['Completed Jobs'],
      'Completed Jobs': ['Request Reviews', 'GBP Post', 'Render Video Ad'],
      'GBP Post': ['Seasonal Offer'],
      'Render Video Ad': ['Seasonal Offer'],
      'Seasonal Offer': ['Source Report'],
    },
  },
  {
    id: 'care-and-winback',
    name: 'Client Care & Win-Back',
    agentId: 'client-care',
    summary:
      'Follow up after every job, catch unhappy clients early, ask happy ones for referrals, and reactivate lapsed customers.',
    trigger: 'schedule',
    cadence: 'Daily 4pm',
    webhookPath: '/webhook/eagle-care',
    nodes: [
      { name: 'Every day 4pm', type: 'n8n-nodes-base.scheduleTrigger', notes: 'Cron' },
      { name: 'Recent Jobs', type: 'n8n-nodes-base.googleSheets', notes: 'Last 48h' },
      { name: 'Satisfaction Check', type: 'n8n-nodes-base.httpRequest', notes: '1-tap survey' },
      { name: 'Happy? Ask Referral', type: 'n8n-nodes-base.if', notes: 'Route by score' },
      { name: 'Unhappy? Escalate', type: 'n8n-nodes-base.slack', notes: 'Human now' },
      { name: 'Lapsed Win-Back', type: 'n8n-nodes-base.code', notes: 'No job in 60d' },
      { name: 'Send Offers', type: 'n8n-nodes-base.httpRequest', notes: 'Email + SMS' },
    ],
    connections: {
      'Every day 4pm': ['Recent Jobs'],
      'Recent Jobs': ['Satisfaction Check'],
      'Satisfaction Check': ['Happy? Ask Referral', 'Unhappy? Escalate'],
      'Happy? Ask Referral': ['Lapsed Win-Back'],
      'Lapsed Win-Back': ['Send Offers'],
    },
  },
];

export function eagleWorkflowsForAgent(agentId: string): EagleWorkflow[] {
  return EAGLE_WORKFLOWS.filter((w) => w.agentId === agentId);
}

`````
