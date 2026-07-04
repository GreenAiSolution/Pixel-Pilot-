// ─── EAGLE · QUICKBOOKS OAUTH START ──────────────────────────────────────────
// GET /api/eagle/quickbooks/connect
// The "Connect QuickBooks" button. Redirects the owner to Intuit's consent
// screen. Sets a CSRF `state` cookie the callback verifies.

import { NextResponse } from 'next/server';
import { buildAuthUrl, quickbooksConfigured, redirectUri } from '@/eagle/quickbooks';

export async function GET() {
  if (!quickbooksConfigured() || !redirectUri()) {
    return NextResponse.json(
      {
        error: 'QuickBooks not configured',
        need: ['QUICKBOOKS_CLIENT_ID', 'QUICKBOOKS_CLIENT_SECRET', 'QUICKBOOKS_REDIRECT_URI'],
        hint: 'Add these in Vercel → Settings → Environment Variables, then redeploy.',
      },
      { status: 503 }
    );
  }
  const state = crypto.randomUUID();
  const res = NextResponse.redirect(buildAuthUrl(state));
  res.cookies.set('qbo_state', state, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/' });
  return res;
}
