---
tags: [pixel-pilot, source]
file: app/api/pixel-pilot/zapier/route.ts
---

# `app/api/pixel-pilot/zapier/route.ts`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/app/api/pixel-pilot/zapier/route.ts`

`````ts
// ─── PIXEL PILOT · ZAPIER TRIGGER ────────────────────────────────────────────
// POST /api/pixel-pilot/zapier
// Forwards a JSON payload to a Zapier "Catch Hook" webhook (ZAPIER_HOOK_URL).
// That Zap fans the event out to the user's apps — post to Slack, log a row in
// Google Sheets, send a Gmail digest, etc. This is how the *deployed* site talks
// to Zapier: the agent's chat MCP session can't be used server-side, but a Catch
// Hook is a plain URL any backend can POST to.
//
// With no ZAPIER_HOOK_URL set the route returns { configured: false } so the
// Automator degrades gracefully instead of erroring.

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // empty body is fine
  }

  const hook = process.env.ZAPIER_HOOK_URL;
  if (!hook) {
    return NextResponse.json({ ok: false, configured: false, reason: 'ZAPIER_HOOK_URL not set' });
  }

  try {
    const res = await fetch(hook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'pixel-pilot',
        sentAt: new Date().toISOString(),
        ...body,
      }),
    });
    return NextResponse.json({ ok: res.ok, configured: true, status: res.status });
  } catch (err) {
    return NextResponse.json(
      { ok: false, configured: true, error: err instanceof Error ? err.message : 'Zapier trigger failed' },
      { status: 502 }
    );
  }
}

`````
