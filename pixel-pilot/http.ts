// ─── PIXEL PILOT · HARDENED HTTP ─────────────────────────────────────────────
// One outbound-fetch helper for the whole engine. Plain `fetch` has no timeout,
// so a slow or hung upstream (Anthropic, KV, HubSpot, an ad platform, n8n…) pins
// the serverless function until the platform kills it — the classic "spinner of
// death". This wraps fetch with an AbortController deadline and an optional
// retry-with-backoff for transient failures, and turns an abort into a legible
// timeout error instead of a bare DOMException.
//
// Usage mirrors fetch: `fetchWithTimeout(url, { timeoutMs, retries, ...init })`.

export interface FetchWithTimeoutInit extends RequestInit {
  /** Abort the request after this many ms (default 10s). */
  timeoutMs?: number;
  /** Extra attempts on network error / timeout (default 0). Retries are for
   *  idempotent calls only — the caller decides. */
  retries?: number;
  /** Base backoff between retries in ms (default 300, exponential + jitter). */
  backoffMs?: number;
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "upstream";
  }
}

/**
 * fetch with a hard timeout + optional retry/backoff. Always clears its timer.
 * Honors a caller-supplied `signal` (its abort wins). Throws a clear Error on
 * timeout; re-throws the last error after exhausting retries.
 */
export async function fetchWithTimeout(
  url: string,
  init: FetchWithTimeoutInit = {}
): Promise<Response> {
  const { timeoutMs = 10_000, retries = 0, backoffMs = 300, signal, ...rest } = init;

  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    // If the caller passed a signal, abort our controller when theirs fires.
    const onCallerAbort = () => controller.abort();
    if (signal) {
      if (signal.aborted) controller.abort();
      else signal.addEventListener("abort", onCallerAbort, { once: true });
    }

    try {
      return await fetch(url, { ...rest, signal: controller.signal });
    } catch (err) {
      lastErr = err;
      const timedOut = err instanceof Error && err.name === "AbortError" && !signal?.aborted;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, Math.min(4_000, backoffMs * 2 ** attempt) + Math.floor(Math.random() * 100)));
        continue;
      }
      if (timedOut) throw new Error(`Request to ${hostOf(url)} timed out after ${timeoutMs}ms`);
      throw err;
    } finally {
      clearTimeout(timer);
      if (signal) signal.removeEventListener("abort", onCallerAbort);
    }
  }

  // Unreachable (loop either returns or throws), but keeps TS + callers honest.
  throw lastErr instanceof Error ? lastErr : new Error(`Request to ${hostOf(url)} failed`);
}
