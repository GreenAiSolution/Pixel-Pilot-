// ─── PIXEL PILOT · OPERATOR DECK AUTH ────────────────────────────────────────
// Owner-only access for the business surfaces (the Orbital CRM at /deck/*) and
// their API routes. Deliberately simple and dependency-free: one shared key.
//
// Env:
//   PP_DECK_KEY — the operator passcode. When set, /deck/* and the CRM API
//   require it. When unset: open in dev (so local work never locks you out),
//   hard-locked in production (client data must never default to public).
//
// The browser never stores the raw key — after login the cookie holds a
// SHA-256 of it, verified statelessly on every request. Agents and scripts can
// alternatively send the raw key in an `x-deck-key` header.

import { createHash, timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';

export const DECK_COOKIE = 'pp_deck';

export function deckKeyConfigured(): boolean {
  return Boolean(process.env.PP_DECK_KEY);
}

/** The value stored in the auth cookie — a hash, never the key itself. */
export function deckCookieValue(): string {
  return createHash('sha256').update(`pp-deck:${process.env.PP_DECK_KEY ?? ''}`).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** True when `candidate` is the raw operator key. */
export function deckKeyMatches(candidate: string): boolean {
  const key = process.env.PP_DECK_KEY;
  return Boolean(key && candidate && safeEqual(candidate, key));
}

export type DeckAccess = 'open-dev' | 'authorized' | 'denied' | 'locked-unconfigured';

/**
 * Resolve access for a request: cookie hash or raw-key header when the key is
 * configured; otherwise open in dev, locked in production.
 */
export function deckAccess(req: NextRequest): DeckAccess {
  if (!deckKeyConfigured()) {
    return process.env.NODE_ENV === 'production' ? 'locked-unconfigured' : 'open-dev';
  }
  const header = req.headers.get('x-deck-key');
  if (header && deckKeyMatches(header)) return 'authorized';
  const cookie = req.cookies.get(DECK_COOKIE)?.value;
  if (cookie && safeEqual(cookie, deckCookieValue())) return 'authorized';
  return 'denied';
}

export function deckAllowed(req: NextRequest): boolean {
  const a = deckAccess(req);
  return a === 'authorized' || a === 'open-dev';
}

/** Same check for server components, given the cookie value from next/headers. */
export function deckCookieAllowed(cookie: string | undefined): { allowed: boolean; access: DeckAccess } {
  if (!deckKeyConfigured()) {
    const open = process.env.NODE_ENV !== 'production';
    return { allowed: open, access: open ? 'open-dev' : 'locked-unconfigured' };
  }
  const ok = Boolean(cookie && safeEqual(cookie, deckCookieValue()));
  return { allowed: ok, access: ok ? 'authorized' : 'denied' };
}
