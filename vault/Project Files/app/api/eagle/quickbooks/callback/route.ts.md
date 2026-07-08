---
tags: [pixel-pilot, source]
file: app/api/eagle/quickbooks/callback/route.ts
---

# `app/api/eagle/quickbooks/callback/route.ts`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/app/api/eagle/quickbooks/callback/route.ts`

````ts
// ─── EAGLE · QUICKBOOKS OAUTH CALLBACK ───────────────────────────────────────
// GET /api/eagle/quickbooks/callback?code=…&realmId=…&state=…
// Intuit redirects here after the owner approves. Verify state, exchange the
// code for tokens, persist them, and bounce back to the ops dashboard.

import { NextRequest, NextResponse } from 'next/server';
import { exchangeCode } from '@/eagle/quickbooks';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const realmId = url.searchParams.get('realmId');
  const state = url.searchParams.get('state');
  const cookieState = req.cookies.get('qbo_state')?.value;

  const ops = new URL('/eagle/ops', url.origin);

  if (url.searchParams.get('error')) {
    ops.searchParams.set('qb', 'denied');
    return NextResponse.redirect(ops);
  }
  if (!code || !realmId) {
    ops.searchParams.set('qb', 'missing');
    return NextResponse.redirect(ops);
  }
  if (!state || !cookieState || state !== cookieState) {
    ops.searchParams.set('qb', 'badstate');
    return NextResponse.redirect(ops);
  }

  try {
    await exchangeCode(code, realmId);
    ops.searchParams.set('qb', 'connected');
  } catch {
    ops.searchParams.set('qb', 'error');
  }
  const res = NextResponse.redirect(ops);
  res.cookies.delete('qbo_state');
  return res;
}
````
