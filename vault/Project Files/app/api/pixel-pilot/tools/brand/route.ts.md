---
tags: [pixel-pilot, source]
file: app/api/pixel-pilot/tools/brand/route.ts
---

# `app/api/pixel-pilot/tools/brand/route.ts`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/app/api/pixel-pilot/tools/brand/route.ts`

````ts
// ─── PIXEL PILOT · TOOL · BRAND IDENTITY KIT ─────────────────────────────────
// POST /api/pixel-pilot/tools/brand
// Body: { business, vibe?, audience?, name? }
// Workflow: name/tagline + positioning + color system + voice + do/don't rules.
// Live with ANTHROPIC_API_KEY; a structured preview otherwise (no gap).

import { NextRequest, NextResponse } from 'next/server';
import { askClaudeJSON, aiConfigured, AINotConfiguredError } from '@/pixel-pilot/ai';
import { pushToList } from '@/pixel-pilot/store';

export const maxDuration = 60;

interface BrandInput {
  business?: string;
  vibe?: string;
  audience?: string;
  name?: string;
}
interface Swatch {
  name: string;
  hex: string;
  use: string;
}
interface BrandResult {
  name: string;
  tagline: string;
  mission: string;
  positioning: string;
  palette: Swatch[];
  fonts: { heading: string; body: string };
  voice: string[];
  dos: string[];
  donts: string[];
}

export async function POST(req: NextRequest) {
  const input = (await req.json().catch(() => ({}))) as BrandInput;
  const business = input.business?.trim() || 'a modern business';

  const system =
    'You are Pixel Pilot, a world-class brand strategist and identity designer. You build sharp, ownable brand systems — memorable names, a defensible position, a real color system with hex codes, and a voice a team can actually write in.';
  const prompt =
    `Design a complete brand identity kit for: ${business}.\n` +
    `Desired vibe: ${input.vibe || 'premium, modern, confident'}. Audience: ${input.audience || 'the core buyer'}.` +
    (input.name ? ` Keep or refine the working name "${input.name}".` : '') +
    `\nReturn JSON: {\n` +
    `  name: string, tagline: string (<8 words), mission: string (1 sentence),\n` +
    `  positioning: string (1-2 sentences on the wedge vs. competitors),\n` +
    `  palette: [{name, hex (#RRGGBB), use}] (5-6 swatches: primary, secondary, accent, 2 neutrals),\n` +
    `  fonts: { heading: string, body: string } (real, widely-available web fonts),\n` +
    `  voice: string[] (4 voice principles), dos: string[] (4), donts: string[] (4)\n}`;

  try {
    const result = await askClaudeJSON<BrandResult>({ system, prompt, maxTokens: 2200 });
    await pushToList('pp:tools:brand', { at: new Date().toISOString(), business, result });
    return NextResponse.json({ ok: true, live: true, result });
  } catch (err) {
    if (err instanceof AINotConfiguredError) {
      return NextResponse.json({ ok: true, live: false, note: 'Preview — add ANTHROPIC_API_KEY for a fully-designed brand kit.', result: previewBrand(business) });
    }
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'failed' }, { status: 502 });
  }
}

export async function GET() {
  return NextResponse.json({ tool: 'brand-identity-kit', live: aiConfigured(), method: 'POST', body: ['business', 'vibe?', 'audience?', 'name?'] });
}

function previewBrand(business: string): BrandResult {
  return {
    name: 'Northstar',
    tagline: 'Built to convert.',
    mission: `Give ${business} an unfair, ownable presence in its market.`,
    positioning: 'The premium choice for operators who refuse to look like everyone else — sharper, faster, and unmistakably theirs.',
    palette: [
      { name: 'Deep Space', hex: '#05060F', use: 'Primary background' },
      { name: 'Cyan Neon', hex: '#00D4FF', use: 'Primary accent / links' },
      { name: 'Electric Violet', hex: '#6C63FF', use: 'Secondary accent' },
      { name: 'Pixel Magenta', hex: '#FF2E9A', use: 'Highlights / CTAs' },
      { name: 'Apex Gold', hex: '#C9A84C', use: 'Premium detail' },
      { name: 'Mist', hex: '#8890A0', use: 'Body text' },
    ],
    fonts: { heading: 'Space Grotesk', body: 'Inter' },
    voice: ['Confident, never arrogant', 'Concrete over clever', 'Short sentences that land', 'Proof before promise'],
    dos: ['Lead with the outcome', 'Use real numbers', 'Speak to one person', 'Earn every claim'],
    donts: ["Don't use hype words", "Don't bury the CTA", "Don't guarantee returns", "Don't sound like a template"],
  };
}
````
