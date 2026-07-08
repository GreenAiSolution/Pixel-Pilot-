---
tags: [pixel-pilot, source]
file: app/api/pixel-pilot/tools/pretest/route.ts
---

# `app/api/pixel-pilot/tools/pretest/route.ts`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/app/api/pixel-pilot/tools/pretest/route.ts`

````ts
// ─── PIXEL PILOT · TOOL · SYNTHETIC AD PRE-TESTING ───────────────────────────
// POST /api/pixel-pilot/tools/pretest
// Body: { product, audience?, variants: string[] }
// Workflow: build synthetic buyer personas, score each ad variant, rank them.
// Live with ANTHROPIC_API_KEY; heuristic preview otherwise (no gap).

import { NextRequest, NextResponse } from 'next/server';
import { askClaudeJSON, aiConfigured, AINotConfiguredError } from '@/pixel-pilot/ai';
import { pushToList } from '@/pixel-pilot/store';

export const maxDuration = 60;

interface PretestInput {
  product?: string;
  audience?: string;
  variants?: string[];
}
interface Scored {
  variant: string;
  score: number; // 0-100 predicted performance
  scrollStop: number;
  clarity: number;
  clickIntent: number;
  verdict: 'launch' | 'iterate' | 'kill';
  why: string;
}
interface PretestResult {
  personas: string[];
  ranked: Scored[];
}

export async function POST(req: NextRequest) {
  const input = (await req.json().catch(() => ({}))) as PretestInput;
  const variants = (input.variants || []).map((v) => v.trim()).filter(Boolean);
  if (!variants.length) {
    return NextResponse.json({ ok: false, error: 'Provide at least one ad variant to test.' }, { status: 400 });
  }
  const product = input.product?.trim() || 'the product';

  const system =
    'You are Pixel Pilot\'s synthetic testing arena. You model realistic buyer personas and predict ad performance calibrated to real DTC benchmarks. Be discriminating — do not score everything highly.';
  const prompt =
    `Product: ${product}. Audience: ${input.audience || 'the core buyer'}.\n` +
    `Build 3 synthetic buyer personas, then score these ad variants against them:\n` +
    variants.map((v, i) => `${i + 1}. ${v}`).join('\n') +
    `\nReturn JSON: { personas: string[] (3 short persona descriptions), ranked: [{ variant, score (0-100), scrollStop (0-100), clarity (0-100), clickIntent (0-100), verdict: "launch"|"iterate"|"kill", why }] } sorted best-first.`;

  try {
    const result = await askClaudeJSON<PretestResult>({ system, prompt, maxTokens: 2500 });
    await pushToList('pp:tools:pretest', { at: new Date().toISOString(), product, count: variants.length });
    return NextResponse.json({ ok: true, live: true, result });
  } catch (err) {
    if (err instanceof AINotConfiguredError) {
      return NextResponse.json({ ok: true, live: false, note: 'Heuristic preview — add ANTHROPIC_API_KEY for real persona scoring.', result: previewPretest(variants) });
    }
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'failed' }, { status: 502 });
  }
}

export async function GET() {
  return NextResponse.json({ tool: 'synthetic-pretest', live: aiConfigured(), method: 'POST', body: ['product', 'audience?', 'variants: string[]'] });
}

function previewPretest(variants: string[]): PretestResult {
  const ranked = variants
    .map((v) => {
      const len = v.length;
      const scrollStop = Math.max(35, Math.min(95, 90 - Math.abs(len - 60)));
      const clarity = Math.max(40, Math.min(95, 100 - Math.floor(len / 3)));
      const clickIntent = Math.round((scrollStop + clarity) / 2);
      const score = Math.round(scrollStop * 0.4 + clarity * 0.3 + clickIntent * 0.3);
      const verdict: Scored['verdict'] = score >= 70 ? 'launch' : score >= 55 ? 'iterate' : 'kill';
      return { variant: v, score, scrollStop, clarity, clickIntent, verdict, why: 'Heuristic estimate from hook length and clarity; enable AI for persona-scored results.' };
    })
    .sort((a, b) => b.score - a.score);
  return { personas: ['Value-driven founder', 'Skeptical performance buyer', 'Time-poor operator'], ranked };
}
````
