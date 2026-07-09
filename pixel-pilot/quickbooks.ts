// ─── PIXEL PILOT · QUICKBOOKS ONLINE (native) ────────────────────────────────
// A first-class QuickBooks Online integration — no Zapier in the path. Set Intuit
// app credentials, click "Connect QuickBooks" once (OAuth2), and Pixel Pilot can
// read the connected company and write records (e.g. a customer) directly.
//
// Env:
//   QUICKBOOKS_CLIENT_ID / QUICKBOOKS_CLIENT_SECRET   (Intuit developer app)
//   QUICKBOOKS_ENV = sandbox | production             (default sandbox)
//   QUICKBOOKS_REDIRECT_URI  (…/api/pixel-pilot/connectors/quickbooks/callback)
//   Token durability: KV_REST_API_URL / KV_REST_API_TOKEN (see ./store). Without
//   it tokens live in memory — fine to test, add KV before go-live so the refresh
//   token survives restarts.

import { get as kvGet, set as kvSet } from './store';
import { fetchWithTimeout } from './http';

const AUTH_URL = 'https://appcenter.intuit.com/connect/oauth2';
const TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
const SCOPE = 'com.intuit.quickbooks.accounting';
const TOKEN_KEY = 'pp:qbo:tokens';

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

interface Tokens {
  access_token: string;
  refresh_token: string;
  realm_id: string;
  expires_at: number; // ms epoch
}

function basicAuth(): string {
  return Buffer.from(
    `${process.env.QUICKBOOKS_CLIENT_ID}:${process.env.QUICKBOOKS_CLIENT_SECRET}`
  ).toString('base64');
}

/** Exchange the OAuth code (from the callback) for tokens and persist them. */
export async function exchangeCode(code: string, realmId: string): Promise<void> {
  const res = await fetchWithTimeout(TOKEN_URL, {
    timeoutMs: 12_000,
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
  await kvSet<Tokens>(TOKEN_KEY, {
    access_token: d.access_token,
    refresh_token: d.refresh_token,
    realm_id: realmId,
    expires_at: Date.now() + (d.expires_in - 60) * 1000,
  });
}

async function refresh(t: Tokens): Promise<Tokens> {
  const res = await fetchWithTimeout(TOKEN_URL, {
    timeoutMs: 12_000,
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
  await kvSet<Tokens>(TOKEN_KEY, next);
  return next;
}

export async function isConnected(): Promise<boolean> {
  return Boolean(await kvGet<Tokens>(TOKEN_KEY));
}

async function validToken(): Promise<Tokens | null> {
  let t = await kvGet<Tokens>(TOKEN_KEY);
  if (!t) return null;
  if (Date.now() >= t.expires_at) t = await refresh(t);
  return t;
}

/** Read the connected company's name — the cheapest proof the pipe is live. */
export async function companyInfo(): Promise<{ name: string; realmId: string } | null> {
  const t = await validToken();
  if (!t) return null;
  const res = await fetchWithTimeout(
    `${apiBase()}/v3/company/${t.realm_id}/companyinfo/${t.realm_id}?minorversion=73`,
    { timeoutMs: 12_000, headers: { Authorization: `Bearer ${t.access_token}`, Accept: 'application/json' } }
  );
  if (!res.ok) throw new Error(`QuickBooks companyInfo failed (${res.status})`);
  const d = (await res.json()) as { CompanyInfo?: { CompanyName: string } };
  return d.CompanyInfo ? { name: d.CompanyInfo.CompanyName, realmId: t.realm_id } : null;
}

/** Create (or return) a QuickBooks customer — e.g. from a captured lead. */
export async function createCustomer(lead: {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}): Promise<{ id: string; name: string } | null> {
  const t = await validToken();
  if (!t) return null;
  const body: Record<string, unknown> = {
    DisplayName: `${lead.name} (${Date.now().toString().slice(-5)})`,
    GivenName: lead.name,
  };
  if (lead.email) body.PrimaryEmailAddr = { Address: lead.email };
  if (lead.phone) body.PrimaryPhone = { FreeFormNumber: lead.phone };
  if (lead.notes) body.Notes = lead.notes;

  const res = await fetchWithTimeout(`${apiBase()}/v3/company/${t.realm_id}/customer?minorversion=73`, {
    timeoutMs: 12_000,
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
