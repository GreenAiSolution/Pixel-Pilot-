---
tags: [phx-growth, source]
file: app/api/phx-growth/tools/route.ts
---

# `app/api/phx-growth/tools/route.ts`

Part of [[📁 Codebase]] — live copy at `~/PHX-Growth/app/api/phx-growth/tools/route.ts`

**Imports** [[Project Files/phx-growth/ai.ts|ai.ts]] · [[Project Files/phx-growth/index.ts|index.ts]]

````ts
// ─── PHX GROWTH · TOOL REGISTRY API ────────────────────────────────────────
// GET /api/phx-growth/tools
// A discoverable map of every Studio tool, where it runs, and what "good" means.

import { NextResponse } from 'next/server';
import { STUDIO_TOOLS, STUDIO_TOOL_FLOW, studioHref } from '@/phx-growth';
import { aiConfigured } from '@/phx-growth/ai';

export async function GET() {
  return NextResponse.json({
    ok: true,
    live: aiConfigured(),
    flow: STUDIO_TOOL_FLOW,
    tools: STUDIO_TOOLS.map((tool) => ({
      ...tool,
      href: studioHref(tool.id),
    })),
  });
}
````
