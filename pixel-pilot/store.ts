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

import type { BoardMeeting } from './board';

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
  await fetch(`${kv.url}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${kv.token}`, 'Content-Type': 'application/json' },
    body: json,
  }).catch(() => {});
}

export async function get<T>(key: string): Promise<T | null> {
  const kv = kvEnv();
  if (kv) {
    try {
      const res = await fetch(`${kv.url}/get/${encodeURIComponent(key)}`, {
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
  await fetch(`${kv.url}/del/${encodeURIComponent(key)}`, {
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

// ── Daily Board Meeting persistence ──────────────────────────────────────────
// Meetings are keyed by date (one per day) and also tracked in a newest-first
// index list for the /boardroom page. Same durable-when-KV, in-memory-otherwise
// behavior as everything else above.

const BOARD_INDEX_KEY = 'pixel-pilot:board:index';
const boardKey = (date: string) => `pixel-pilot:board:meeting:${date}`;

/** Persist a board meeting by date and keep the index list current (deduped). */
export async function saveBoardMeeting(meeting: BoardMeeting): Promise<void> {
  await set(boardKey(meeting.date), meeting);
  const index = await getList<BoardMeeting>(BOARD_INDEX_KEY);
  const next = [meeting, ...index.filter((m) => m.date !== meeting.date)]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 200);
  memLists.set(BOARD_INDEX_KEY, next.map((x) => JSON.stringify(x)));
  await set(BOARD_INDEX_KEY, next);
}

/** Read a single day's minutes (null when none). */
export async function getBoardMeeting(date: string): Promise<BoardMeeting | null> {
  return get<BoardMeeting>(boardKey(date));
}

/** List recent meetings, newest first. */
export async function listBoardMeetings(limit = 30): Promise<BoardMeeting[]> {
  const index = await getList<BoardMeeting>(BOARD_INDEX_KEY);
  return index.slice(0, limit);
}
