// ─── PIXEL PILOT · QUICKBOOKS OAUTH START ────────────────────────────────────
// GET /api/pixel-pilot/connectors/quickbooks
// The "Connect QuickBooks" button. Redirects to Intuit's consent screen and sets
// a CSRF `state` cookie the callback verifies. Static segment — takes precedence
// over the [provider] dynamic route for the ad connectors.

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { buildAuthUrl, quickbooksConfigured, redirectUri } from '@/pixel-pilot/quickbooks';

export const maxDuration = 15;

export async function GET() {
  if (!quickbooksConfigured() || !redirectUri()) {
    return NextResponse.json(
      {
        error: 'QuickBooks is not connected yet',
        need: ['QUICKBOOKS_CLIENT_ID', 'QUICKBOOKS_CLIENT_SECRET', 'QUICKBOOKS_REDIRECT_URI'],
        hint: 'Add these in Vercel → Settings → Environment Variables, then redeploy.',
        status: 'available',
      },
      { status: 503 }
    );
  }
  const state = crypto.randomUUID();
  const res = NextResponse.redirect(buildAuthUrl(state));
  res.cookies.set('pp_qbo_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  return res;
}
