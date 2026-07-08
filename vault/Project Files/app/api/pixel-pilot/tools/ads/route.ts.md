---
tags: [pixel-pilot, source]
file: app/api/pixel-pilot/tools/ads/route.ts
---

# `app/api/pixel-pilot/tools/ads/route.ts`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/app/api/pixel-pilot/tools/ads/route.ts`

**Imports** [[Project Files/pixel-pilot/ai.ts|ai.ts]] · [[Project Files/pixel-pilot/store.ts|store.ts]]

````ts
// ─── PIXEL PILOT · TOOL · PREMIUM AI ADS ─────────────────────────────────────
// POST /api/pixel-pilot/tools/ads
// Body: { product, audience?, angle?, platform? }
// Workflow: write platform-native ad copy + compliance screen + visual brief.
// Live with ANTHROPIC_API_KEY; returns a structured preview otherwise (no gap).

import { NextRequest, NextResponse } from 'next/server';
import { askClaudeJSON, aiConfigured, AINotConfiguredError } from '@/pixel-pilot/ai';
import { pushToList } from '@/pixel-pilot/store';

// Allow long Claude generations to finish instead of timing out (freezing).
export const maxDuration = 60;

interface AdInput {
  product?: string;
  audience?: string;
  angle?: string;
  platform?: string;
}
interface AdResult {
  hook: string;
  primaryText: string;
  headline: string;
  cta: string;
  compliance: { verdict: 'clear' | 'soften' | 'block'; notes: string };
  visualBrief: string;
}

export async function POST(req: NextRequest) {
  const input = (await req.json().catch(() => ({}))) as AdInput;
  const product = input.product?.trim() || 'the product';
  const platform = input.platform?.trim() || 'Meta';

  const system =
    'You are Pixel Pilot, an elite direct-response ad copywriter and platform-policy expert. Write scroll-stopping, defensible ad copy for regulated-friendly DTC brands. No guaranteed-returns language.';
  const prompt =
    `Write a ${platform} ad for: ${product}.\n` +
    `Audience: ${input.audience || 'the core buyer'}. Angle: ${input.angle || 'the sharpest benefit'}.\n` +
    `Return JSON with keys: hook (one scroll-stopping line), primaryText (60-90 words), headline (<7 words), cta (2-4 words), ` +
    `compliance ({verdict: "clear"|"soften"|"block", notes}), visualBrief (a 1-2 sentence on-brand image brief: deep-space, cyan→violet→magenta).`;

  try {
    const result = await askClaudeJSON<AdResult>({ system, prompt, maxTokens: 1500 });
    await pushToList('pp:tools:ads', { at: new Date().toISOString(), product, platform, result });
    return NextResponse.json({ ok: true, live: true, result });
  } catch (err) {
    if (err instanceof AINotConfiguredError) {
      return NextResponse.json({
        ok: true,
        live: false,
        note: 'Preview — add ANTHROPIC_API_KEY to generate real copy.',
        result: previewAd(product, platform, input),
      });
    }
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'failed' }, { status: 502 });
  }
}

export async function GET() {
  return NextResponse.json({ tool: 'premium-ai-ads', live: aiConfigured(), method: 'POST', body: ['product', 'audience?', 'angle?', 'platform?'] });
}

function previewAd(product: string, platform: string, i: AdInput): AdResult {
  return {
    hook: `Stop scrolling — ${product} changes the math.`,
    primaryText: `Most ${i.audience || 'brands'} overpay for results they can't see. ${product} fixes the ${i.angle || 'core problem'} without the guesswork — so every dollar works harder. See why the smart money is switching.`,
    headline: 'Built to convert',
    cta: 'Learn more',
    compliance: { verdict: 'clear', notes: 'No guaranteed-returns language; defensible for regulated niches.' },
    visualBrief: `A premium ${platform} hero on deep-space navy, cyan→violet→magenta gradient light, the product as the hero with clean negative space for the headline.`,
  };
}
````
