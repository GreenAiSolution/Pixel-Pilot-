---
tags: [pixel-pilot, source]
file: app/api/pixel-pilot/connectors/quickbooks/callback/route.ts
---

# `app/api/pixel-pilot/connectors/quickbooks/callback/route.ts`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/app/api/pixel-pilot/connectors/quickbooks/callback/route.ts`

````ts
// ─── PIXEL PILOT · QUICKBOOKS OAUTH CALLBACK ─────────────────────────────────
// GET /api/pixel-pilot/connectors/quickbooks/callback?code=…&realmId=…&state=…
// Intuit redirects here after consent. Verify the CSRF state, exchange the code
// for tokens (persisted via ./store), and bounce back to the Automator.

import { NextRequest, NextResponse } from 'next/server';
import { exchangeCode } from '@/pixel-pilot/quickbooks';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const realmId = url.searchParams.get('realmId');
  const state = url.searchParams.get('state');
  const cookieState = req.cookies.get('pp_qbo_state')?.value;

  const back = new URL('/automator', process.env.NEXT_PUBLIC_APP_URL || url.origin);

  if (url.searchParams.get('error')) {
    back.searchParams.set('qb', 'denied');
    return NextResponse.redirect(back);
  }
  if (!code || !realmId) {
    back.searchParams.set('qb', 'missing');
    return NextResponse.redirect(back);
  }
  if (!state || !cookieState || state !== cookieState) {
    back.searchParams.set('qb', 'badstate');
    return NextResponse.redirect(back);
  }

  try {
    await exchangeCode(code, realmId);
    back.searchParams.set('qb', 'connected');
  } catch {
    back.searchParams.set('qb', 'error');
  }
  const res = NextResponse.redirect(back);
  res.cookies.delete('pp_qbo_state');
  return res;
}
````
