// ─── PIXEL PILOT · DECK AUTH ─────────────────────────────────────────────────
// POST   /api/pixel-pilot/deck/auth → { key } — exchange the operator key for
//        the httpOnly deck cookie (30 days). Rate-limited hard: it's a lock.
// DELETE /api/pixel-pilot/deck/auth → clear the cookie (log out).
// GET    /api/pixel-pilot/deck/auth → { access } — safe status probe.

import { NextRequest, NextResponse } from 'next/server';
import { guard, ok, fail, requestId, log } from '@/pixel-pilot/api';
import {
  DECK_COOKIE,
  deckAccess,
  deckCookieValue,
  deckKeyConfigured,
  deckKeyMatches,
} from '@/pixel-pilot/deck-auth';

export const maxDuration = 10;

const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export async function GET(req: NextRequest) {
  return NextResponse.json({ ok: true, access: deckAccess(req), configured: deckKeyConfigured() });
}

export async function POST(req: NextRequest) {
  const g = await guard(req, {
    source: 'deck-auth',
    bucket: 'deck-auth',
    limit: 10,
    windowSec: 300,
    schema: { key: { type: 'string', required: true, maxLen: 200 } },
  });
  if (!g.ok) return g.response;

  if (!deckKeyConfigured()) {
    return fail(503, 'Operator key not configured — set PP_DECK_KEY in the environment.', g.rid);
  }
  if (!deckKeyMatches(g.body.key as string)) {
    log('warn', 'deck-auth', 'bad operator key attempt');
    return fail(401, 'Wrong key.', g.rid);
  }

  const res = ok({ access: 'authorized' }, g.rid);
  res.cookies.set(DECK_COOKIE, deckCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}

export async function DELETE() {
  const res = ok({ access: 'denied' }, requestId());
  res.cookies.set(DECK_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
