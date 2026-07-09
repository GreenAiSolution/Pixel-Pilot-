// ─── PIXEL PILOT · API ROUTE TOOLKIT ─────────────────────────────────────────
// Shared server-side helpers so every route handles the boring-but-critical
// parts the same way: a request id for tracing, a consistent JSON envelope,
// structured logging, a body-size + JSON guard, a tiny schema validator, and a
// one-call `guard()` that does rate-limit + parse + validate. Zero dependencies.

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { rateLimit, type RateLimitOptions } from './ratelimit';

export function requestId(): string {
  try {
    return randomUUID();
  } catch {
    return `req_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  }
}

/** Best-effort client IP from the proxy headers Vercel sets. */
export function clientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  return (xff ? xff.split(',')[0].trim() : '') || req.headers.get('x-real-ip') || 'unknown';
}

export function log(
  level: 'info' | 'warn' | 'error',
  source: string,
  msg: string,
  extra?: Record<string, unknown>
): void {
  const payload = JSON.stringify({ level, source, msg, ...(extra ?? {}), at: new Date().toISOString() });
  const sink = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  sink(`[pixel-pilot:${source}] ${payload}`);
}

/** Success envelope — keeps the route's own fields, adds requestId + header. */
export function ok(data: Record<string, unknown>, rid: string, init?: ResponseInit): NextResponse {
  return NextResponse.json(
    { ok: true, ...data, requestId: rid },
    { ...init, headers: { ...(init?.headers ?? {}), 'x-request-id': rid } }
  );
}

/** Error envelope — consistent shape + status + requestId header. */
export function fail(status: number, error: string, rid: string, extra?: Record<string, unknown>): NextResponse {
  return NextResponse.json({ ok: false, error, ...(extra ?? {}), requestId: rid }, { status, headers: { 'x-request-id': rid } });
}

/** Read + parse a JSON body with a hard size cap (default 100 KB). */
export async function readJson<T>(
  req: NextRequest,
  maxBytes = 100_000
): Promise<{ data: T | null; error?: string }> {
  const declared = Number(req.headers.get('content-length') || 0);
  if (declared && declared > maxBytes) return { data: null, error: 'Request body too large' };
  try {
    const text = await req.text();
    if (text.length > maxBytes) return { data: null, error: 'Request body too large' };
    return { data: (text ? JSON.parse(text) : {}) as T };
  } catch {
    return { data: null, error: 'Invalid JSON body' };
  }
}

// ── Tiny schema validator (no zod) ───────────────────────────────────────────

export interface FieldSpec {
  type: 'string' | 'number' | 'boolean' | 'array';
  required?: boolean;
  /** Max string length or array length. */
  maxLen?: number;
  /** Max numeric value. */
  max?: number;
}
export type Schema = Record<string, FieldSpec>;

export function validate(
  body: unknown,
  schema: Schema
): { ok: true; value: Record<string, unknown> } | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Body must be a JSON object' };
  }
  const src = body as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  for (const [key, spec] of Object.entries(schema)) {
    const v = src[key];
    const empty = v === undefined || v === null || v === '';
    if (empty) {
      if (spec.required) return { ok: false, error: `Missing required field: ${key}` };
      continue;
    }
    switch (spec.type) {
      case 'string': {
        if (typeof v !== 'string') return { ok: false, error: `${key} must be a string` };
        if (spec.maxLen && v.length > spec.maxLen) return { ok: false, error: `${key} exceeds ${spec.maxLen} chars` };
        out[key] = v.trim();
        break;
      }
      case 'number': {
        const n = typeof v === 'number' ? v : Number(v);
        if (Number.isNaN(n)) return { ok: false, error: `${key} must be a number` };
        if (spec.max !== undefined && n > spec.max) return { ok: false, error: `${key} exceeds ${spec.max}` };
        out[key] = n;
        break;
      }
      case 'boolean':
        out[key] = Boolean(v);
        break;
      case 'array': {
        if (!Array.isArray(v)) return { ok: false, error: `${key} must be an array` };
        if (spec.maxLen && v.length > spec.maxLen) return { ok: false, error: `${key} has too many items (max ${spec.maxLen})` };
        out[key] = v;
        break;
      }
    }
  }
  return { ok: true, value: out };
}

// ── One-call guard: rate-limit → size/JSON → validate ────────────────────────

export interface GuardOptions {
  source: string;
  bucket: string;
  limit?: number;
  windowSec?: number;
  maxBytes?: number;
  schema?: Schema;
}

export type GuardResult =
  | { ok: true; rid: string; body: Record<string, unknown> }
  | { ok: false; response: NextResponse };

/**
 * The standard preamble for a public POST route. Returns validated `body` + a
 * request id, or a ready-to-return NextResponse (429 / 400).
 */
export async function guard(req: NextRequest, opts: GuardOptions): Promise<GuardResult> {
  const rid = requestId();
  const ip = clientIp(req);

  const rlOpts: RateLimitOptions = { limit: opts.limit, windowSec: opts.windowSec };
  const rl = await rateLimit(opts.bucket, ip, rlOpts);
  if (!rl.ok) {
    log('warn', opts.source, 'rate limited', { ip, retryAfter: rl.retryAfter });
    return {
      ok: false,
      response: fail(429, 'Too many requests — please slow down.', rid, { retryAfter: rl.retryAfter }),
    };
  }

  const parsed = await readJson<Record<string, unknown>>(req, opts.maxBytes);
  if (parsed.error) return { ok: false, response: fail(400, parsed.error, rid) };

  let body = parsed.data ?? {};
  if (opts.schema) {
    const v = validate(body, opts.schema);
    if (!v.ok) return { ok: false, response: fail(400, v.error, rid) };
    body = { ...body, ...v.value }; // overlay trimmed/coerced values
  }

  return { ok: true, rid, body };
}
