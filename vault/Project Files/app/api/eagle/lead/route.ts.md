---
tags: [pixel-pilot, source]
file: app/api/eagle/lead/route.ts
---

# `app/api/eagle/lead/route.ts`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/app/api/eagle/lead/route.ts`

````ts
// ─── EAGLE LANDSCAPING · LEAD INTAKE ─────────────────────────────────────────
// POST /api/eagle/lead
// The live front door for Rowan (Sales Closer). Captures a quote request and
// forwards it to the Eagle Zapier Catch Hook (EAGLE_ZAPIER_HOOK_URL), which fans
// it out to: QuickBooks (create/find customer), Slack (#leads hot alert), and
// Gmail (auto-reply). Degrades gracefully — with no hook set it still accepts the
// lead and reports what *would* route, so the site never drops a customer.

import { NextRequest, NextResponse } from 'next/server';
import { getEagleService, createCustomer, quickbooksConfigured } from '@/eagle';

export async function POST(req: NextRequest) {
  let body: Record<string, string> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const name = (body.name ?? '').toString().trim().slice(0, 120);
  const phone = (body.phone ?? '').toString().trim().slice(0, 40);
  const email = (body.email ?? '').toString().trim().slice(0, 160);
  const service = getEagleService(body.service)?.name ?? 'General inquiry';
  const address = (body.address ?? '').toString().trim().slice(0, 200);
  const details = (body.details ?? '').toString().trim().slice(0, 1000);

  if (!name || (!phone && !email)) {
    return NextResponse.json({ error: 'Name and a phone or email are required' }, { status: 400 });
  }

  const lead = {
    source: 'eagle-landscaping-website',
    receivedAt: new Date().toISOString(),
    name,
    phone,
    email,
    service,
    address,
    details,
  };

  const routed: string[] = [];

  // 1 · Native QuickBooks — create the customer directly via the Intuit API when
  // the owner has connected QuickBooks (no Zapier in the path).
  let quickbooks: { id: string; name: string } | null | undefined;
  if (quickbooksConfigured()) {
    try {
      quickbooks = await createCustomer({ name, email, phone, address, notes: `${service}: ${details}` });
      if (quickbooks) routed.push(`QuickBooks customer #${quickbooks.id}`);
    } catch {
      // Not connected yet or transient — never lose the lead over it.
    }
  }

  // 2 · Zapier Catch Hook (optional additional fan-out to Slack/Gmail/Sheets).
  const hook = process.env.EAGLE_ZAPIER_HOOK_URL;
  if (!hook) {
    if (!routed.length) routed.push('captured (connect QuickBooks or set EAGLE_ZAPIER_HOOK_URL to route live)');
    return NextResponse.json({ ok: true, configured: Boolean(quickbooks), quickbooks: quickbooks ?? null, lead, routed });
  }
  routed.push('Slack #leads', 'Gmail auto-reply');

  try {
    const res = await fetch(hook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    });
    return NextResponse.json({ ok: res.ok, configured: true, status: res.status, routed });
  } catch (err) {
    // Never lose a lead on a hook failure.
    return NextResponse.json({
      ok: true,
      configured: true,
      delivered: false,
      note: err instanceof Error ? err.message : 'hook failed; lead captured',
      lead,
      routed,
    });
  }
}
````
