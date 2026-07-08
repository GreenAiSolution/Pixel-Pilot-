---
tags: [pixel-pilot, source]
file: app/api/pixel-pilot/connectors/[provider]/callback/route.ts
---

# `app/api/pixel-pilot/connectors/[provider]/callback/route.ts`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/app/api/pixel-pilot/connectors/[provider]/callback/route.ts`

`````ts
// ─── PIXEL PILOT · CONNECTOR OAUTH CALLBACK ──────────────────────────────────
// GET /api/pixel-pilot/connectors/[provider]/callback
// The other half of the round-trip. Verifies the CSRF state cookie set by the
// start route, exchanges the authorization code for tokens, and redirects home
// with a legible status. One dynamic handler covers all four connectors.
//
// Persistence note: this standalone app has no datastore, so a successful
// exchange sets an httpOnly "connected" flag cookie and does NOT keep the raw
// token. In production this is exactly where you would encrypt + store the
// access/refresh tokens against the account (see pixel-pilot/README.md).

import { NextRequest, NextResponse } from 'next/server';
import { CONNECTORS, isConnectorId, connectorIsLive, exchangeCode } from '@/pixel-pilot';

function backHome(req: NextRequest, params: Record<string, string>) {
  const url = new URL('/', process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return NextResponse.redirect(url);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;

  if (!isConnectorId(provider)) {
    return NextResponse.json(
      { error: 'Unknown connector', valid: Object.keys(CONNECTORS) },
      { status: 400 }
    );
  }
  const connector = CONNECTORS[provider];
  const q = req.nextUrl.searchParams;

  // Provider reported an error (user denied, etc.).
  const providerError = q.get('error') || q.get('error_description');
  if (providerError) {
    return backHome(req, { connect_error: provider });
  }

  // Verify CSRF state against the cookie the start route planted.
  const state = q.get('state');
  const cookieState = req.cookies.get(`pp_oauth_${provider}`)?.value;
  if (!state || !cookieState || state !== cookieState) {
    return backHome(req, { connect_error: provider, reason: 'state' });
  }

  const code = q.get('code');
  if (!code) {
    return backHome(req, { connect_error: provider, reason: 'code' });
  }

  if (!connectorIsLive(connector)) {
    return backHome(req, { connect_error: provider, reason: 'unconfigured' });
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const redirectUri = `${origin}/api/pixel-pilot/connectors/${provider}/callback`;
  const shop = q.get('shop') ?? undefined;

  try {
    // Exchange happens here. We intentionally don't persist the token in this
    // standalone build — swap this for an encrypted write in production.
    await exchangeCode(connector, { code, redirectUri, shop });

    const res = backHome(req, { connected: provider });
    // Clear the one-time state cookie and mark the connector connected.
    res.cookies.set(`pp_oauth_${provider}`, '', { maxAge: 0, path: '/' });
    res.cookies.set(`pp_conn_${provider}`, '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    return res;
  } catch (err) {
    console.error(`[pixel-pilot] ${provider} callback failed:`, err);
    return backHome(req, { connect_error: provider, reason: 'exchange' });
  }
}

`````
