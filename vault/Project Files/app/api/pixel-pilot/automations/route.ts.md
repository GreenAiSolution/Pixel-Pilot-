---
tags: [pixel-pilot, source]
file: app/api/pixel-pilot/automations/route.ts
---

# `app/api/pixel-pilot/automations/route.ts`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/app/api/pixel-pilot/automations/route.ts`

````ts
// ─── PIXEL PILOT · AUTOMATIONS (persist + execute) ───────────────────────────
// POST /api/pixel-pilot/automations   → save a deployed automation and run it
// GET  /api/pixel-pilot/automations   → list what's been deployed
//
// This is the backend the Automator's "Deploy" button talks to. It persists the
// manifest (durable when KV is configured, in-memory otherwise) and fires the
// real side-effects server-side: the n8n workflow, the Zapier fan-out, and —
// when the automation opts in and QuickBooks is connected — a live QuickBooks
// read that proves the accounting pipe is open. Every step degrades gracefully
// and is recorded in the saved receipt, so a deploy never hard-fails.

import { NextRequest, NextResponse } from 'next/server';
import { pushToList, getList, storeIsDurable } from '@/pixel-pilot/store';
import { triggerWorkflow, fireZapier, type Receipt } from '@/pixel-pilot/executor';
import { isConnected as qbConnected, companyInfo as qbCompanyInfo } from '@/pixel-pilot/quickbooks';

const LIST_KEY = 'pp:automations';

interface Manifest {
  id?: string;
  service?: string;
  workflowId?: string | null;
  syncQuickbooks?: boolean;
  [k: string]: unknown;
}

export interface DeployedAutomation extends Manifest {
  id: string;
  deployedAt: string;
  receipts: Receipt[];
}

export async function GET() {
  const items = await getList<DeployedAutomation>(LIST_KEY);
  return NextResponse.json({ ok: true, durable: storeIsDurable(), count: items.length, items });
}

export async function POST(req: NextRequest) {
  let manifest: Manifest = {};
  try {
    const body = (await req.json()) as { manifest?: Manifest };
    manifest = body.manifest ?? (body as Manifest);
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const receipts: Receipt[] = [];

  // 1 · Fire the n8n workflow bound to this service (dry-run when unconfigured).
  if (manifest.workflowId) {
    receipts.push(await triggerWorkflow(manifest.workflowId, manifest));
  }

  // 2 · Fan the deploy event out to the user's apps via Zapier.
  receipts.push(
    await fireZapier('automation.deployed', { service: manifest.service ?? 'automation', manifest })
  );

  // 3 · QuickBooks (opt-in) — prove the accounting connection is live.
  if (manifest.syncQuickbooks) {
    try {
      if (await qbConnected()) {
        const company = await qbCompanyInfo();
        receipts.push({
          target: 'quickbooks',
          configured: true,
          ok: Boolean(company),
          detail: company ? `Connected to ${company.name}` : 'No company on token',
        });
      } else {
        receipts.push({
          target: 'quickbooks',
          configured: false,
          ok: false,
          detail: 'QuickBooks not connected — connect it at /api/pixel-pilot/connectors/quickbooks',
        });
      }
    } catch (err) {
      receipts.push({
        target: 'quickbooks',
        configured: true,
        ok: false,
        detail: err instanceof Error ? err.message : 'QuickBooks check failed',
      });
    }
  }

  const record: DeployedAutomation = {
    ...manifest,
    id: manifest.id ?? `auto_${Date.now().toString(36)}`,
    deployedAt: new Date().toISOString(),
    receipts,
  };
  await pushToList<DeployedAutomation>(LIST_KEY, record);

  return NextResponse.json({ ok: true, durable: storeIsDurable(), automation: record });
}
````
