---
tags: [pixel-pilot, source]
file: app/api/pixel-pilot/tools/route.ts
---

# `app/api/pixel-pilot/tools/route.ts`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/app/api/pixel-pilot/tools/route.ts`

**Imports** [[Project Files/pixel-pilot/ai.ts|ai.ts]] · [[Project Files/pixel-pilot/index.ts|index.ts]]

````ts
// ─── PIXEL PILOT · TOOL REGISTRY API ────────────────────────────────────────
// GET /api/pixel-pilot/tools
// A discoverable map of every Studio tool, where it runs, and what "good" means.

import { NextResponse } from 'next/server';
import { STUDIO_TOOLS, STUDIO_TOOL_FLOW, studioHref } from '@/pixel-pilot';
import { aiConfigured } from '@/pixel-pilot/ai';

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
