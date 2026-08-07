---
tags: [phx-growth, source]
file: app/api/phx-growth/connectors/[provider]/route.ts
---

# `app/api/phx-growth/connectors/[provider]/route.ts`

Part of [[📁 Codebase]] — live copy at `~/PHX-Growth/app/api/phx-growth/connectors/[provider]/route.ts`

**Imports** [[Project Files/phx-growth/index.ts|index.ts]]

````ts
// ─── PHX GROWTH · CONNECTOR OAUTH START ─────────────────────────────────────
// GET /api/phx-growth/connectors/[provider]
// Mints a live OAuth consent URL for one of the four connectors and redirects to
// it. Returns a legible 503 (not a broken redirect) when the connector's
// credentials are not yet configured, and 400 for an unknown provider.

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  CONNECTORS,
  isConnectorId,
  connectorIsLive,
  buildAuthUrl,
} from '@/phx-growth';

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

  if (!connectorIsLive(connector)) {
    return NextResponse.json(
      {
        error: `${connector.name} is not connected yet`,
        hint: `Set ${connector.auth.clientIdEnv} and ${connector.auth.clientSecretEnv}`,
        status: 'available',
      },
      { status: 503 }
    );
  }

  const state = crypto.randomBytes(32).toString('hex');
  const origin = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const redirectUri = `${origin}/api/phx-growth/connectors/${provider}/callback`;

  try {
    const shop = req.nextUrl.searchParams.get('shop') ?? undefined;
    const url = buildAuthUrl(connector, { state, redirectUri, shop });

    const res = NextResponse.redirect(url);
    // CSRF state — verified on callback. httpOnly, short-lived.
    res.cookies.set(`pp_oauth_${provider}`, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    });
    return res;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to start OAuth' },
      { status: 400 }
    );
  }
}
````
