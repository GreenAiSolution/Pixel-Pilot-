// ─── PIXEL PILOT · PERSISTENCE ───────────────────────────────────────────────
// One tiny datastore for the whole engine. Talks to a KV REST API (Vercel KV /
// Upstash) when its env vars are present, and falls back to an in-process map so
// everything still works in local/dev with nothing configured.
//
// Env (optional — durable when set, in-memory when not). Auto-detects the KV
// REST credentials no matter what the Vercel/Upstash integration named them —
// KV_REST_API_URL, UPSTASH_REDIS_REST_URL, or any prefixed variant like
// STORAGE_KV_REST_API_URL — plus their matching *_TOKEN. So whichever "Custom
// Environment Variable Prefix" is chosen when connecting the database, it works.
//
// This is deliberately small: `get`/`set`/`del` for single keys and
// `pushToList`/`getList` for append-and-read collections (used for deployed
// automations). Values are JSON-serialized. Never store raw secrets unencrypted
// in a shared store in production — connector tokens go through here only because
// the KV instance is private to the deployment.

import { fetchWithTimeout } from './http';

// KV is on the hot path for almost every request, so keep its deadline short —
// a hiccup should fall back to the in-memory map fast, not hang the function.
const KV_TIMEOUT_MS = 4_000;

const memKV = new Map<string, string>();
const memLists = new Map<string, string[]>();

function findEnv(matches: (key: string) => boolean): string | undefined {
  const key = Object.keys(process.env).find((k) => matches(k) && Boolean(process.env[k]));
  return key ? process.env[key] : undefined;
}

function kvEnv(): { url: string; token: string } | null {
  // A REST URL ending in the known suffix (any prefix), preferring the canonical names.
  const url =
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    findEnv((k) => k.endsWith('KV_REST_API_URL') || k.endsWith('UPSTASH_REDIS_REST_URL'));
  // The matching write token — never the read-only one.
  const token =
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    findEnv(
      (k) =>
        (k.endsWith('KV_REST_API_TOKEN') || k.endsWith('UPSTASH_REDIS_REST_TOKEN')) &&
        !k.includes('READ_ONLY')
    );
  return url && token ? { url, token } : null;
}

/** True when a durable KV backend is wired; false when using the memory fallback. */
export function storeIsDurable(): boolean {
  return kvEnv() !== null;
}

export async function set<T>(key: string, value: T): Promise<void> {
  const json = JSON.stringify(value);
  memKV.set(key, json);
  const kv = kvEnv();
  if (!kv) return;
  await fetchWithTimeout(`${kv.url}/set/${encodeURIComponent(key)}`, {
    timeoutMs: KV_TIMEOUT_MS,
    method: 'POST',
    headers: { Authorization: `Bearer ${kv.token}`, 'Content-Type': 'application/json' },
    body: json,
  }).catch(() => {});
}

export async function get<T>(key: string): Promise<T | null> {
  const kv = kvEnv();
  if (kv) {
    try {
      const res = await fetchWithTimeout(`${kv.url}/get/${encodeURIComponent(key)}`, {
        timeoutMs: KV_TIMEOUT_MS,
        headers: { Authorization: `Bearer ${kv.token}` },
      });
      if (res.ok) {
        const data = (await res.json()) as { result?: string | null };
        if (data.result) return JSON.parse(data.result) as T;
        if (data.result === null) return null;
      }
    } catch {
      // fall through to memory
    }
  }
  const local = memKV.get(key);
  return local ? (JSON.parse(local) as T) : null;
}

export async function del(key: string): Promise<void> {
  memKV.delete(key);
  const kv = kvEnv();
  if (!kv) return;
  await fetchWithTimeout(`${kv.url}/del/${encodeURIComponent(key)}`, {
    timeoutMs: KV_TIMEOUT_MS,
    method: 'POST',
    headers: { Authorization: `Bearer ${kv.token}` },
  }).catch(() => {});
}

/** Append an item to a JSON list stored under `key` (newest first), capped. */
export async function pushToList<T>(key: string, item: T, cap = 200): Promise<T[]> {
  const current = (await getList<T>(key)) ?? [];
  const next = [item, ...current].slice(0, cap);
  memLists.set(key, next.map((x) => JSON.stringify(x)));
  await set(key, next);
  return next;
}

export async function getList<T>(key: string): Promise<T[]> {
  const viaKV = await get<T[]>(key);
  if (viaKV) return viaKV;
  const local = memLists.get(key);
  return local ? local.map((x) => JSON.parse(x) as T) : [];
}

// Per-window counters for rate limiting. In-memory is per-instance (weaker) but
// fine as a fallback; KV (Upstash INCR + EXPIRE) counts across the whole fleet.
const memCounters = new Map<string, { n: number; exp: number }>();

/** Atomically increment `key`, setting a TTL on first touch. Returns the count. */
export async function incr(key: string, ttlSeconds: number): Promise<number> {
  const kv = kvEnv();
  if (kv) {
    try {
      const res = await fetchWithTimeout(`${kv.url}/incr/${encodeURIComponent(key)}`, {
        timeoutMs: KV_TIMEOUT_MS,
        headers: { Authorization: `Bearer ${kv.token}` },
      });
      if (res.ok) {
        const data = (await res.json()) as { result?: number };
        const n = typeof data.result === 'number' ? data.result : 1;
        if (n === 1) {
          // First hit in this window → arm the expiry so the counter resets.
          await fetchWithTimeout(`${kv.url}/expire/${encodeURIComponent(key)}/${ttlSeconds}`, {
            timeoutMs: KV_TIMEOUT_MS,
            headers: { Authorization: `Bearer ${kv.token}` },
          }).catch(() => {});
        }
        return n;
      }
    } catch {
      // fall through to in-memory
    }
  }
  const now = Date.now();
  const cur = memCounters.get(key);
  if (!cur || cur.exp < now) {
    memCounters.set(key, { n: 1, exp: now + ttlSeconds * 1000 });
    return 1;
  }
  cur.n += 1;
  return cur.n;
}
