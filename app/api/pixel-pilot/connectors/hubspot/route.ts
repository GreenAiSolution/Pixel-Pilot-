// ─── PIXEL PILOT · HUBSPOT OAUTH START ───────────────────────────────────────
// GET /api/pixel-pilot/connectors/hubspot
// The "Connect HubSpot" button. Redirects a customer to HubSpot's consent screen
// and sets a CSRF `state` cookie the callback verifies. Static segment — takes
// precedence over the [provider] dynamic route.
//
// Refuses (503) unless BOTH the app credentials and the encryption key are set,
// so we never begin a flow we couldn't securely persist.

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { buildInstallUrl, hubspotConfigured } from '@/pixel-pilot/hubspot';
import { tokenEncryptionConfigured } from '@/pixel-pilot/crypto';

export const maxDuration = 15;

export async function GET(req: NextRequest) {
  if (!hubspotConfigured() || !tokenEncryptionConfigured()) {
    return NextResponse.json(
      {
        error: 'HubSpot is not connected yet',
        need: [
          ...(hubspotConfigured() ? [] : ['HUBSPOT_CLIENT_ID', 'HUBSPOT_CLIENT_SECRET']),
          ...(tokenEncryptionConfigured() ? [] : ['PP_ENCRYPTION_KEY']),
        ],
        hint: 'Add these in Vercel → Settings → Environment Variables, then redeploy.',
        status: 'available',
      },
      { status: 503 }
    );
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const redirectUri = `${origin}/api/pixel-pilot/connectors/hubspot/callback`;
  const state = crypto.randomBytes(32).toString('hex');

  const res = NextResponse.redirect(buildInstallUrl({ state, redirectUri }));
  res.cookies.set('pp_hs_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  return res;
}
