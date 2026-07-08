// ─── PIXEL PILOT · HUBSPOT OAUTH ─────────────────────────────────────────────
// The install → callback → refresh lifecycle for connecting a CUSTOMER's HubSpot.
// Refresh tokens are encrypted (AES-256-GCM, see ../crypto) and stored in the KV
// (see ../store), keyed by the portal (hub) id. Access tokens are refreshed
// transparently by getAccessToken() — callers never touch a raw refresh token.
//
// Env:
//   HUBSPOT_CLIENT_ID / HUBSPOT_CLIENT_SECRET  — the HubSpot app credentials
//   PP_ENCRYPTION_KEY                          — required to store tokens (crypto)
//   Durability: KV_REST_API_URL / _TOKEN (see ../store) — in-memory without it.

import { get as kvGet, set as kvSet, del as kvDel } from '../store';
import { encryptSecret, decryptSecret, tokenEncryptionConfigured } from '../crypto';
import {
  HUBSPOT_SCOPES,
  type ConnectionRef,
  type HubSpotConnection,
  type StoredTokens,
} from './types';

const AUTH_URL = 'https://app.hubspot.com/oauth/authorize';
const TOKEN_URL = 'https://api.hubapi.com/oauth/v1/token';
const TOKEN_INFO_URL = 'https://api.hubapi.com/oauth/v1/access-tokens/';

// Refresh a little before the token actually expires, to avoid edge-of-expiry races.
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

function tokenKey(ref: ConnectionRef): string {
  return `pp:hubspot:tokens:${ref}`;
}

// What we actually persist: metadata in the clear (so we can decide refresh
// without decrypting), secrets encrypted as one blob.
interface StoredRecord {
  portalId: string;
  scopes: string[];
  expiresAt: number;
  connectedAt: string;
  enc: string; // encryptSecret(JSON.stringify({ accessToken, refreshToken }))
}

export function hubspotConfigured(): boolean {
  return Boolean(process.env.HUBSPOT_CLIENT_ID && process.env.HUBSPOT_CLIENT_SECRET);
}

/** Build the consent URL. The route sets the CSRF `state` cookie it passes here. */
export function buildInstallUrl(opts: { state: string; redirectUri: string }): string {
  const clientId = process.env.HUBSPOT_CLIENT_ID;
  if (!clientId) throw new Error('HubSpot is not configured — set HUBSPOT_CLIENT_ID / HUBSPOT_CLIENT_SECRET');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: opts.redirectUri,
    scope: HUBSPOT_SCOPES.join(' '),
    state: opts.state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

// ── Persistence helpers ───────────────────────────────────────────────────────

async function saveTokens(t: StoredTokens): Promise<HubSpotConnection> {
  if (!tokenEncryptionConfigured()) {
    throw new Error('PP_ENCRYPTION_KEY missing — refusing to store HubSpot tokens unencrypted');
  }
  const record: StoredRecord = {
    portalId: t.portalId,
    scopes: t.scopes,
    expiresAt: t.expiresAt,
    connectedAt: new Date().toISOString(),
    enc: encryptSecret(JSON.stringify({ accessToken: t.accessToken, refreshToken: t.refreshToken })),
  };
  await kvSet(tokenKey(t.portalId), record);
  return { portalId: record.portalId, scopes: record.scopes, expiresAt: record.expiresAt, connectedAt: record.connectedAt };
}

async function loadRecord(ref: ConnectionRef): Promise<StoredRecord | null> {
  return kvGet<StoredRecord>(tokenKey(ref));
}

function decryptRecord(record: StoredRecord): { accessToken: string; refreshToken: string } {
  return JSON.parse(decryptSecret(record.enc)) as { accessToken: string; refreshToken: string };
}

// ── Token endpoint ────────────────────────────────────────────────────────────

interface HubSpotTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number; // seconds
}

async function postToken(form: URLSearchParams): Promise<HubSpotTokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  });
  if (!res.ok) {
    throw new Error(`HubSpot token request failed (${res.status})`);
  }
  return (await res.json()) as HubSpotTokenResponse;
}

// The portal id + granted scopes live on the token-info endpoint, not the token
// response — so we look them up once right after exchange.
async function fetchTokenInfo(accessToken: string): Promise<{ portalId: string; scopes: string[] }> {
  const res = await fetch(`${TOKEN_INFO_URL}${accessToken}`);
  if (!res.ok) throw new Error(`HubSpot token info failed (${res.status})`);
  const data = (await res.json()) as { hub_id: number; scopes?: string[] };
  return { portalId: String(data.hub_id), scopes: data.scopes ?? [...HUBSPOT_SCOPES] };
}

// ── Public lifecycle ──────────────────────────────────────────────────────────

/** Exchange the auth code, resolve the portal id, encrypt + persist tokens. */
export async function exchangeCodeForTokens(opts: {
  code: string;
  redirectUri: string;
}): Promise<HubSpotConnection> {
  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('HubSpot is not configured — set HUBSPOT_CLIENT_ID / HUBSPOT_CLIENT_SECRET');
  }

  const token = await postToken(
    new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: opts.redirectUri,
      code: opts.code,
    })
  );

  const info = await fetchTokenInfo(token.access_token);

  return saveTokens({
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: Date.now() + token.expires_in * 1000,
    portalId: info.portalId,
    scopes: info.scopes,
  });
}

/** Safe (non-secret) view of a stored connection, or null if not connected. */
export async function getConnection(ref: ConnectionRef): Promise<HubSpotConnection | null> {
  const record = await loadRecord(ref);
  if (!record) return null;
  return { portalId: record.portalId, scopes: record.scopes, expiresAt: record.expiresAt, connectedAt: record.connectedAt };
}

/** Force a token refresh now and persist the result. */
export async function refreshTokens(ref: ConnectionRef): Promise<HubSpotConnection> {
  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('HubSpot is not configured — set HUBSPOT_CLIENT_ID / HUBSPOT_CLIENT_SECRET');
  }

  const record = await loadRecord(ref);
  if (!record) throw new Error(`No HubSpot connection for portal ${ref}`);
  const { refreshToken } = decryptRecord(record);

  const token = await postToken(
    new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    })
  );

  return saveTokens({
    accessToken: token.access_token,
    // HubSpot may or may not rotate the refresh token; keep the newest one.
    refreshToken: token.refresh_token ?? refreshToken,
    expiresAt: Date.now() + token.expires_in * 1000,
    portalId: record.portalId,
    scopes: record.scopes,
  });
}

/** Return a valid access token, refreshing transparently when near expiry. */
export async function getAccessToken(ref: ConnectionRef): Promise<string> {
  const record = await loadRecord(ref);
  if (!record) throw new Error(`No HubSpot connection for portal ${ref}`);

  if (record.expiresAt - Date.now() <= REFRESH_MARGIN_MS) {
    await refreshTokens(ref);
    const fresh = await loadRecord(ref);
    if (!fresh) throw new Error(`HubSpot connection for portal ${ref} vanished after refresh`);
    return decryptRecord(fresh).accessToken;
  }

  return decryptRecord(record).accessToken;
}

/** Delete stored tokens for a connection. */
export async function disconnect(ref: ConnectionRef): Promise<void> {
  await kvDel(tokenKey(ref));
}
