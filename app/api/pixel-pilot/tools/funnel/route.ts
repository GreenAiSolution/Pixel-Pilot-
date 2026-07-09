// ─── PIXEL PILOT · TOOL · OFFER & FUNNEL ARCHITECT ───────────────────────────
// POST /api/pixel-pilot/tools/funnel
// Body: { product, price?, audience?, goal? }
// Workflow: an irresistible offer (value stack + pricing tiers + guarantee) and
// the funnel steps to sell it. Live with ANTHROPIC_API_KEY; preview otherwise.

import { NextRequest, NextResponse } from 'next/server';
import { askClaudeJSON, aiConfigured, AINotConfiguredError } from '@/pixel-pilot/ai';
import { guard } from '@/pixel-pilot/api';
import { pushToList } from '@/pixel-pilot/store';

export const maxDuration = 60;

interface FunnelInput {
  product?: string;
  price?: string;
  audience?: string;
  goal?: string;
}
interface Tier {
  tier: string;
  price: string;
  includes: string[];
  best?: boolean;
}
interface FunnelResult {
  offerName: string;
  promise: string;
  valueStack: { item: string; value: string }[];
  pricing: Tier[];
  guarantee: string;
  funnelSteps: { step: string; detail: string }[];
  upsell: string;
}

export async function POST(req: NextRequest) {
  const g = await guard(req, {
    source: 'tools/funnel', bucket: 'tools', limit: 20, windowSec: 60,
    schema: { product: { type: 'string', required: true, maxLen: 400 }, price: { type: 'string', maxLen: 80 }, audience: { type: 'string', maxLen: 400 }, goal: { type: 'string', maxLen: 200 } },
  });
  if (!g.ok) return g.response;
  const input = g.body as FunnelInput;
  const product = input.product?.trim() || 'the product';

  const system =
    'You are Pixel Pilot, a direct-response offer architect in the Hormozi school. You build irresistible, defensible offers — a clear promise, a stacked value proposition, sane pricing tiers, a risk-reversing guarantee, and the funnel to sell it. No guaranteed-returns or income claims.';
  const prompt =
    `Architect an offer and funnel for: ${product}.\n` +
    `Target price point: ${input.price || 'position for value'}. Audience: ${input.audience || 'the core buyer'}. Goal: ${input.goal || 'maximize conversions and AOV'}.\n` +
    `Return JSON: {\n` +
    `  offerName: string, promise: string (the core dream outcome, 1 sentence),\n` +
    `  valueStack: [{item, value ($ anchor)}] (4-6 components),\n` +
    `  pricing: [{tier, price, includes: string[], best: boolean}] (3 tiers, exactly one best:true),\n` +
    `  guarantee: string (a bold, honest risk-reversal — no income guarantees),\n` +
    `  funnelSteps: [{step, detail}] (4-6 steps from ad to purchase to upsell),\n` +
    `  upsell: string (the one-click order bump / upsell)\n}`;

  try {
    const result = await askClaudeJSON<FunnelResult>({ system, prompt, maxTokens: 2800 });
    await pushToList('pp:tools:funnel', { at: new Date().toISOString(), product });
    return NextResponse.json({ ok: true, live: true, result });
  } catch (err) {
    if (err instanceof AINotConfiguredError) {
      return NextResponse.json({ ok: true, live: false, note: 'Preview — add ANTHROPIC_API_KEY for a fully-built offer.', result: previewFunnel(product) });
    }
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'failed' }, { status: 502 });
  }
}

export async function GET() {
  return NextResponse.json({ tool: 'offer-funnel-architect', live: aiConfigured(), method: 'POST', body: ['product', 'price?', 'audience?', 'goal?'] });
}

function previewFunnel(product: string): FunnelResult {
  return {
    offerName: `The ${product} Advantage`,
    promise: `Get the result ${product} is built for — without the guesswork, on a timeline you can plan around.`,
    valueStack: [
      { item: 'Core product', value: '$497' },
      { item: 'Onboarding & setup', value: '$297' },
      { item: 'Playbook & templates', value: '$197' },
      { item: 'Priority support', value: '$149' },
    ],
    pricing: [
      { tier: 'Starter', price: '$97', includes: ['Core product', 'Templates'], best: false },
      { tier: 'Pro', price: '$197', includes: ['Everything in Starter', 'Onboarding', 'Priority support'], best: true },
      { tier: 'Scale', price: '$497', includes: ['Everything in Pro', 'Done-with-you setup', 'Quarterly review'], best: false },
    ],
    guarantee: '30-day, no-questions refund. If it does not earn its place in your stack, you pay nothing.',
    funnelSteps: [
      { step: '1 · Ad', detail: 'Scroll-stopping hook to a focused landing page' },
      { step: '2 · Landing page', detail: 'The promise, the stack, the proof, one CTA' },
      { step: '3 · Checkout', detail: 'Tiered pricing with the Pro tier anchored as best value' },
      { step: '4 · Order bump', detail: 'One-click add-on at checkout' },
      { step: '5 · Thank-you upsell', detail: 'The next logical step, one click to add' },
    ],
    upsell: 'Add the done-with-you setup for a one-time bump — most buyers take it.',
  };
}
