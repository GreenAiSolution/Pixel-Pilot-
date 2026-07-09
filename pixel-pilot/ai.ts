// ─── PIXEL PILOT · AI ENGINE ─────────────────────────────────────────────────
// The shared Claude layer that powers the tools. Talks to the Anthropic Messages
// API over fetch (no SDK dependency — matches the rest of the engine), using
// claude-fable-5 (Claude 5 family, current flagship). Gated on ANTHROPIC_API_KEY:
// when it's absent, callers get a typed AINotConfiguredError and fall back to a
// structured stub so no workflow ever hard-fails.
//
// Env: ANTHROPIC_API_KEY  (get one at https://console.anthropic.com)

import { fetchWithTimeout } from './http';

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-fable-5';

export class AINotConfiguredError extends Error {
  constructor() {
    super('ANTHROPIC_API_KEY is not set — AI features run in preview mode.');
    this.name = 'AINotConfiguredError';
  }
}

/** Resolve the Anthropic key under any of the common env var names. */
function anthropicKey(): string | undefined {
  return process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || process.env.claude || process.env.CLAUDE;
}

/** True when the Claude engine is wired and live. */
export function aiConfigured(): boolean {
  return Boolean(anthropicKey());
}

export interface AskOptions {
  readonly system?: string;
  readonly prompt: string;
  readonly maxTokens?: number;
}

/** One Claude call → text. Throws AINotConfiguredError when the key is absent. */
export async function askClaude({ system, prompt, maxTokens = 4096 }: AskOptions): Promise<string> {
  const key = anthropicKey();
  if (!key) throw new AINotConfiguredError();

  const res = await fetchWithTimeout(API_URL, {
    timeoutMs: 55_000, // Claude can be slow; stay under the route's maxDuration=60
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      ...(system ? { system } : {}),
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Claude API ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = data.content?.find((b) => b.type === 'text')?.text;
  if (!text) throw new Error('Claude returned no text');
  return text;
}

/**
 * Ask Claude for JSON matching a shape. Instructs JSON-only output and parses
 * defensively (strips code fences / prose). Throws on unconfigured or unparseable.
 */
export async function askClaudeJSON<T>({ system, prompt, maxTokens = 4096 }: AskOptions): Promise<T> {
  const raw = await askClaude({
    system: `${system ?? ''}\n\nRespond with ONLY valid minified JSON — no prose, no markdown fences.`.trim(),
    prompt,
    maxTokens,
  });
  return parseJSON<T>(raw);
}

/** Pull the first JSON object/array out of a model response and parse it. */
export function parseJSON<T>(raw: string): T {
  const cleaned = raw.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const match = cleaned.match(/[[{][\s\S]*[\]}]/);
    if (match) return JSON.parse(match[0]) as T;
    throw new Error('Could not parse JSON from model output');
  }
}
