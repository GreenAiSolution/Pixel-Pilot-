// ─── PHX GROWTH · STACK API ─────────────────────────────────────────────────
// GET /api/phx-growth/stack
// Returns the full integration catalog grouped by category, each tool marked
// with its live status (read from env). This is how agents/tools discover what
// PHX Growth can plug into and what's already connected.

import { NextResponse } from 'next/server';
import { stackByCategory, stackStats, toolIsLive } from '@/phx-growth';

export async function GET() {
  const categories = stackByCategory().map(({ meta, tools }) => ({
    category: meta.id,
    summary: meta.summary,
    tools: tools.map((t) => ({
      id: t.id,
      name: t.name,
      blurb: t.blurb,
      via: t.via,
      live: toolIsLive(t),
    })),
  }));

  return NextResponse.json({ ok: true, stats: stackStats(), categories });
}
