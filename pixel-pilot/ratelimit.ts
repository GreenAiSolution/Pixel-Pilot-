// ─── PIXEL PILOT · RATE LIMITING ─────────────────────────────────────────────
// A lightweight fixed-window limiter for public routes — the AI tool endpoints
// call Claude on every request, so an unthrottled loop is a real bill. Backed by
// the KV counter (fleet-wide) with an in-memory fallback (per-instance). Fails
// OPEN: if the limiter itself errors, the request is allowed — we never take the
// site down to enforce a limit.

import { incr } from './store';

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  /** Seconds until the window resets (0 when not limited). */
  retryAfter: number;
}

export interface RateLimitOptions {
  limit?: number;
  windowSec?: number;
}

/** Count one hit for `id` in `bucket`; returns whether it's within the limit. */
export async function rateLimit(
  bucket: string,
  id: string,
  opts: RateLimitOptions = {}
): Promise<RateLimitResult> {
  const limit = opts.limit ?? 30;
  const windowSec = opts.windowSec ?? 60;
  const nowSec = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(nowSec / windowSec);
  const key = `pp:rl:${bucket}:${id}:${windowStart}`;

  let count: number;
  try {
    count = await incr(key, windowSec);
  } catch {
    // Fail open — never block a request because the limiter had a hiccup.
    return { ok: true, limit, remaining: limit, retryAfter: 0 };
  }

  const withinLimit = count <= limit;
  return {
    ok: withinLimit,
    limit,
    remaining: Math.max(0, limit - count),
    retryAfter: withinLimit ? 0 : windowSec - (nowSec % windowSec),
  };
}
