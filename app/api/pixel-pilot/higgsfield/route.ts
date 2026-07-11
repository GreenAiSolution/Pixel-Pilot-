// ─── PIXEL PILOT · HIGGSFIELD CREATIVE FORGE ─────────────────────────────────
// POST /api/pixel-pilot/higgsfield
// Body: { brand, product, vibe, channel }
// Kicks off a Higgsfield render (or a shaped simulation when no key is set) and
// returns the CreativeJob the Forge polls/animates on screen.

import { NextRequest, NextResponse } from 'next/server';
import { guard, fail } from '@/pixel-pilot/api';
import {
  generateCreative,
  higgsfieldIsLive,
  VIBES,
  type CreativeRequest,
  type CreativeVibe,
} from '@/pixel-pilot';

// A live Higgsfield render can take minutes; on Vercel Pro the ceiling is 300s,
// so give the Forge real headroom instead of timing out a genuine render.
export const maxDuration = 300;

const CHANNELS: CreativeRequest['channel'][] = ['tiktok', 'reels', 'shorts', 'feed'];
const VIBE_IDS = VIBES.map((v) => v.id);

export async function POST(req: NextRequest) {
  const g = await guard(req, {
    source: 'higgsfield', bucket: 'render', limit: 10, windowSec: 60,
    schema: {
      brand: { type: 'string', required: true, maxLen: 80 },
      product: { type: 'string', maxLen: 280 },
      vibe: { type: 'string', maxLen: 40 },
      channel: { type: 'string', maxLen: 40 },
    },
  });
  if (!g.ok) return g.response;
  const body = g.body as Partial<CreativeRequest>;

  const brand = (body.brand ?? '').toString().trim().slice(0, 80);
  const product = (body.product ?? '').toString().trim().slice(0, 280);
  const vibe = (body.vibe ?? 'kinetic') as CreativeVibe;
  const channel = (body.channel ?? 'tiktok') as CreativeRequest['channel'];

  if (!VIBE_IDS.includes(vibe)) {
    return fail(400, 'unknown vibe', g.rid, { valid: VIBE_IDS });
  }
  if (!CHANNELS.includes(channel)) {
    return fail(400, 'unknown channel', g.rid, { valid: CHANNELS });
  }

  try {
    const job = await generateCreative({ brand, product: product || brand, vibe, channel });
    return NextResponse.json({ job, live: higgsfieldIsLive() });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Render failed' },
      { status: 502 }
    );
  }
}
