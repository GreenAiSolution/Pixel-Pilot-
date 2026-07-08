---
tags: [pixel-pilot, source]
file: eagle/quickbooks.ts
---

# `eagle/quickbooks.ts`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/eagle/quickbooks.ts`

`````ts
// ─── EAGLE LANDSCAPING · QUICKBOOKS ONLINE (native) ──────────────────────────
// A first-class QuickBooks Online integration — no Zapier in the path. The owner
// sets Intuit app credentials, clicks "Connect QuickBooks" once (OAuth2), and new
// leads become QuickBooks customers automatically.
//
// Env:
//   QUICKBOOKS_CLIENT_ID / QUICKBOOKS_CLIENT_SECRET   (Intuit developer app)
//   QUICKBOOKS_ENV = sandbox | production             (default sandbox)
//   QUICKBOOKS_REDIRECT_URI                            (…/api/eagle/quickbooks/callback)
//   Token store (durable, for production): KV_REST_API_URL / KV_REST_API_TOKEN
//     (Vercel KV / Upstash). Without it, tokens live in memory — fine to test a
//     connection, but add KV before go-live so the refresh token survives restarts.

const AUTH_URL = 'https://appcenter.intuit.com/connect/oauth2';
const TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
const SCOPE = 'com.intuit.quickbooks.accounting';

function apiBase(): string {
  return (process.env.QUICKBOOKS_ENV || 'sandbox') === 'production'
    ? 'https://quickbooks.api.intuit.com'
    : 'https://sandbox-quickbooks.api.intuit.com';
}

export function quickbooksConfigured(): boolean {
  return Boolean(process.env.QUICKBOOKS_CLIENT_ID && process.env.QUICKBOOKS_CLIENT_SECRET);
}

export function redirectUri(): string {
  return process.env.QUICKBOOKS_REDIRECT_URI || '';
}

export function buildAuthUrl(state: string): string {
  const p = new URLSearchParams({
    client_id: process.env.QUICKBOOKS_CLIENT_ID || '',
    response_type: 'code',
    scope: SCOPE,
    redirect_uri: redirectUri(),
    state,
  });
  return `${AUTH_URL}?${p.toString()}`;
}

// ── Token store (KV REST with in-memory fallback) ────────────────────────────
interface Tokens {
  access_token: string;
  refresh_token: string;
  realm_id: string;
  expires_at: number; // ms epoch
}
const KEY = 'eagle:qbo:tokens';
const mem: { t: Tokens | null } = { t: null };

async function kvSet(t: Tokens): Promise<void> {
  mem.t = t;
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return;
  await fetch(`${url}/set/${KEY}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(t),
  }).catch(() => {});
}

async function kvGet(): Promise<Tokens | null> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) {
    try {
      const res = await fetch(`${url}/get/${KEY}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = (await res.json()) as { result?: string };
        if (data.result) return JSON.parse(data.result) as Tokens;
      }
    } catch {
      /* fall through to memory */
    }
  }
  return mem.t;
}

function basicAuth(): string {
  return Buffer.from(`${process.env.QUICKBOOKS_CLIENT_ID}:${process.env.QUICKBOOKS_CLIENT_SECRET}`).toString('base64');
}

/** Exchange the OAuth code (from the callback) for tokens and persist them. */
export async function exchangeCode(code: string, realmId: string): Promise<void> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUri() }),
  });
  if (!res.ok) throw new Error(`QuickBooks token exchange failed (${res.status}): ${await res.text()}`);
  const d = (await res.json()) as { access_token: string; refresh_token: string; expires_in: number };
  await kvSet({
    access_token: d.access_token,
    refresh_token: d.refresh_token,
    realm_id: realmId,
    expires_at: Date.now() + (d.expires_in - 60) * 1000,
  });
}

async function refresh(t: Tokens): Promise<Tokens> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: t.refresh_token }),
  });
  if (!res.ok) throw new Error(`QuickBooks refresh failed (${res.status})`);
  const d = (await res.json()) as { access_token: string; refresh_token: string; expires_in: number };
  const next: Tokens = {
    access_token: d.access_token,
    refresh_token: d.refresh_token || t.refresh_token, // refresh token rotates
    realm_id: t.realm_id,
    expires_at: Date.now() + (d.expires_in - 60) * 1000,
  };
  await kvSet(next);
  return next;
}

export async function isConnected(): Promise<boolean> {
  return Boolean(await kvGet());
}

async function validToken(): Promise<Tokens | null> {
  let t = await kvGet();
  if (!t) return null;
  if (Date.now() >= t.expires_at) t = await refresh(t);
  return t;
}

/** Create (or return) a QuickBooks customer from an Eagle lead. */
export async function createCustomer(lead: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}): Promise<{ id: string; name: string } | null> {
  const t = await validToken();
  if (!t) return null;
  const body: Record<string, unknown> = { DisplayName: `${lead.name} (${Date.now().toString().slice(-5)})`, GivenName: lead.name };
  if (lead.email) body.PrimaryEmailAddr = { Address: lead.email };
  if (lead.phone) body.PrimaryPhone = { FreeFormNumber: lead.phone };
  if (lead.address) body.BillAddr = { Line1: lead.address };
  if (lead.notes) body.Notes = lead.notes;

  const res = await fetch(`${apiBase()}/v3/company/${t.realm_id}/customer?minorversion=73`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${t.access_token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`QuickBooks createCustomer failed (${res.status}): ${await res.text()}`);
  const d = (await res.json()) as { Customer?: { Id: string; DisplayName: string } };
  return d.Customer ? { id: d.Customer.Id, name: d.Customer.DisplayName } : null;
}

`````
