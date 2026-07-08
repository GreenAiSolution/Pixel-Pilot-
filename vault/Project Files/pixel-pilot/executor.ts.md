---
tags: [pixel-pilot, source]
file: pixel-pilot/executor.ts
---

# `pixel-pilot/executor.ts`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/pixel-pilot/executor.ts`

**Imports** [[Project Files/pixel-pilot/workflows.ts|workflows.ts]]

````ts
// ─── PIXEL PILOT · EXECUTOR ──────────────────────────────────────────────────
// The server-side runtime that actually *runs* a deployed automation. Two real
// side-effects, each degrading gracefully when its target isn't configured:
//
//   1. triggerWorkflow → POSTs to the automation's n8n webhook (the looping
//      brain). Dry-run receipt when N8N_BASE_URL is unset.
//   2. fireZapier      → POSTs the event to a Zapier Catch Hook, which fans out
//      to the user's own apps (Slack, Google Sheets, QuickBooks, Gmail, …).
//
// Both return a small, JSON-safe receipt so the caller (the /automations route)
// can persist exactly what happened. No throwing on a missing integration — a
// deploy should still succeed and record "not configured".

import { getWorkflow } from './workflows';

export interface Receipt {
  readonly target: 'n8n' | 'zapier' | 'quickbooks';
  readonly configured: boolean;
  readonly ok: boolean;
  readonly mode?: 'live' | 'dry-run';
  readonly status?: number;
  readonly detail?: string;
}

/** Trigger the n8n workflow bound to an automation (dry-run when unconfigured). */
export async function triggerWorkflow(workflowId: string, payload: unknown): Promise<Receipt> {
  const workflow = getWorkflow(workflowId);
  if (!workflow) {
    return { target: 'n8n', configured: false, ok: false, detail: `Unknown workflow ${workflowId}` };
  }

  const base = process.env.N8N_BASE_URL;
  if (!base) {
    return { target: 'n8n', configured: false, ok: true, mode: 'dry-run', detail: workflow.webhookPath };
  }

  try {
    const res = await fetch(`${base}${workflow.webhookPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.N8N_WEBHOOK_SECRET ? { 'x-pp-signature': process.env.N8N_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify({ source: 'pixel-pilot', workflow: workflow.id, payload }),
    });
    return { target: 'n8n', configured: true, ok: res.ok, mode: 'live', status: res.status };
  } catch (err) {
    return { target: 'n8n', configured: true, ok: false, detail: err instanceof Error ? err.message : 'trigger failed' };
  }
}

/** Fan an event out to the user's apps via their Zapier Catch Hook. */
export async function fireZapier(event: string, payload: Record<string, unknown>): Promise<Receipt> {
  const hook = process.env.ZAPIER_HOOK_URL;
  if (!hook) {
    return { target: 'zapier', configured: false, ok: false, detail: 'ZAPIER_HOOK_URL not set' };
  }
  try {
    const res = await fetch(hook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'pixel-pilot', event, sentAt: new Date().toISOString(), ...payload }),
    });
    return { target: 'zapier', configured: true, ok: res.ok, status: res.status };
  } catch (err) {
    return { target: 'zapier', configured: true, ok: false, detail: err instanceof Error ? err.message : 'zapier failed' };
  }
}
````
