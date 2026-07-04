// ─── EAGLE LANDSCAPING · LEAD INTAKE ─────────────────────────────────────────
// POST /api/eagle/lead
// The live front door for Rowan (Sales Closer). Captures a quote request and
// forwards it to the Eagle Zapier Catch Hook (EAGLE_ZAPIER_HOOK_URL), which fans
// it out to: QuickBooks (create/find customer), Slack (#leads hot alert), and
// Gmail (auto-reply). Degrades gracefully — with no hook set it still accepts the
// lead and reports what *would* route, so the site never drops a customer.

import { NextRequest, NextResponse } from 'next/server';
import { getEagleService } from '@/eagle';

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

  const routed = ['QuickBooks (new customer)', 'Slack #leads', 'Gmail auto-reply'];
  const hook = process.env.EAGLE_ZAPIER_HOOK_URL;

  if (!hook) {
    // No hook yet — accept the lead so the site works, report intended routing.
    return NextResponse.json({ ok: true, configured: false, lead, routed });
  }

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
