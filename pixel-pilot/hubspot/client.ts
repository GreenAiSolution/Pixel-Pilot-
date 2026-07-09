// ─── PIXEL PILOT · HUBSPOT HTTP CLIENT ───────────────────────────────────────
// Low-level authed HTTP, bound to one connection. Handles the two things every
// HubSpot call has to get right — rate limits (429 / 5xx with exponential backoff
// honoring Retry-After) and cursor pagination — so service.ts stays declarative.

import { getAccessToken } from './oauth';
import { fetchWithTimeout } from '../http';
import type { ConnectionRef } from './types';

const API_BASE = 'https://api.hubapi.com';
const MAX_RETRIES = 5;
const BASE_BACKOFF_MS = 500;
const MAX_PAGE_SIZE = 100; // HubSpot's per-request cap for CRM objects.

type Query = Record<string, string | number | undefined>;

export interface HubSpotClient {
  get<T>(path: string, query?: Query): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
  /** Cursor pagination via `paging.next.after`; yields items across all pages. */
  paginate<T>(
    path: string,
    opts?: { query?: Query; pageSize?: number; maxItems?: number }
  ): AsyncGenerator<T>;
  /** /crm/v3/objects/{type}/batch/read — chunks ids into ≤100 and merges results. */
  batchRead<T>(
    objectType: 'contacts' | 'deals',
    ids: string[],
    properties: string[]
  ): Promise<T[]>;
}

interface PagedResponse<T> {
  results: T[];
  paging?: { next?: { after?: string } };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function buildUrl(path: string, query?: Query): string {
  const url = new URL(path.startsWith('http') ? path : `${API_BASE}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

// How long to wait before retry `attempt` (0-indexed). Prefer the server's
// Retry-After; else exponential backoff with jitter.
function backoffMs(attempt: number, retryAfter: string | null): number {
  if (retryAfter) {
    const secs = Number(retryAfter);
    if (!Number.isNaN(secs)) return secs * 1000;
  }
  const expo = BASE_BACKOFF_MS * 2 ** attempt;
  return expo + Math.floor(Math.random() * 250); // jitter
}

export function createHubSpotClient(ref: ConnectionRef): HubSpotClient {
  // One authed request with retry on 429 + 5xx. Token is fetched per-call so a
  // mid-flight refresh is picked up on the next attempt.
  async function request<T>(method: 'GET' | 'POST', path: string, opts?: { query?: Query; body?: unknown }): Promise<T> {
    let lastErr: unknown;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const accessToken = await getAccessToken(ref);
      const res = await fetchWithTimeout(buildUrl(path, opts?.query), {
        timeoutMs: 15_000, // per-attempt deadline; the loop below owns the retries
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: opts?.body !== undefined ? JSON.stringify(opts.body) : undefined,
      });

      if (res.ok) {
        // 204s (unlikely here) → no JSON body.
        return (res.status === 204 ? undefined : await res.json()) as T;
      }

      // Retry on rate limit + transient server errors; give up on other 4xx.
      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`HubSpot ${method} ${path} → ${res.status}`);
        if (attempt < MAX_RETRIES) {
          await sleep(backoffMs(attempt, res.headers.get('Retry-After')));
          continue;
        }
      }

      const detail = await res.text().catch(() => '');
      throw new Error(`HubSpot ${method} ${path} failed (${res.status})${detail ? `: ${detail.slice(0, 300)}` : ''}`);
    }

    throw lastErr instanceof Error ? lastErr : new Error(`HubSpot ${method} ${path} exhausted retries`);
  }

  const client: HubSpotClient = {
    get: <T>(path: string, query?: Query) => request<T>('GET', path, { query }),
    post: <T>(path: string, body: unknown) => request<T>('POST', path, { body }),

    async *paginate<T>(path: string, o?: { query?: Query; pageSize?: number; maxItems?: number }) {
      const limit = Math.min(o?.pageSize ?? MAX_PAGE_SIZE, MAX_PAGE_SIZE);
      let after: string | undefined;
      let yielded = 0;

      do {
        const page = await request<PagedResponse<T>>('GET', path, {
          query: { ...o?.query, limit, after },
        });
        for (const item of page.results ?? []) {
          yield item;
          if (o?.maxItems && ++yielded >= o.maxItems) return;
        }
        after = page.paging?.next?.after;
      } while (after);
    },

    async batchRead<T>(objectType: 'contacts' | 'deals', ids: string[], properties: string[]) {
      const out: T[] = [];
      for (let i = 0; i < ids.length; i += MAX_PAGE_SIZE) {
        const chunk = ids.slice(i, i + MAX_PAGE_SIZE);
        const page = await request<PagedResponse<T>>('POST', `/crm/v3/objects/${objectType}/batch/read`, {
          body: { properties, inputs: chunk.map((id) => ({ id })) },
        });
        out.push(...(page.results ?? []));
      }
      return out;
    },
  };

  return client;
}
