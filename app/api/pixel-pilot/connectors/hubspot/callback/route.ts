// ─── PIXEL PILOT · HUBSPOT OAUTH CALLBACK ────────────────────────────────────
// GET /api/pixel-pilot/connectors/hubspot/callback?code=…&state=…
// HubSpot redirects here after consent. Verify the CSRF state, exchange the code
// for tokens (encrypted + persisted, keyed by portal id), and bounce back to the
// Automator with a legible status.

import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/pixel-pilot/hubspot';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieState = req.cookies.get('pp_hs_state')?.value;

  const back = new URL('/automator', process.env.NEXT_PUBLIC_APP_URL || url.origin);

  if (url.searchParams.get('error')) {
    back.searchParams.set('hs', 'denied');
    return NextResponse.redirect(back);
  }
  if (!code) {
    back.searchParams.set('hs', 'missing');
    return NextResponse.redirect(back);
  }
  if (!state || !cookieState || state !== cookieState) {
    back.searchParams.set('hs', 'badstate');
    return NextResponse.redirect(back);
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || url.origin;
  const redirectUri = `${origin}/api/pixel-pilot/connectors/hubspot/callback`;

  try {
    const conn = await exchangeCodeForTokens({ code, redirectUri });
    back.searchParams.set('hs', 'connected');
    back.searchParams.set('portal', conn.portalId);
  } catch (err) {
    console.error('[pixel-pilot] hubspot callback failed:', err);
    back.searchParams.set('hs', 'error');
  }

  const res = NextResponse.redirect(back);
  res.cookies.delete('pp_hs_state');
  return res;
}
