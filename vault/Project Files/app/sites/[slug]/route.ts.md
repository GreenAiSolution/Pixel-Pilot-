---
tags: [pixel-pilot, source]
file: app/sites/[slug]/route.ts
---

# `app/sites/[slug]/route.ts`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/app/sites/[slug]/route.ts`

**Imports** [[Project Files/app/api/pixel-pilot/tools/website/route.ts|route.ts]] · [[Project Files/pixel-pilot/store.ts|store.ts]]

````ts
// ─── PIXEL PILOT · HOSTED SITES ──────────────────────────────────────────────
// GET /sites/[slug]
// Serves a site generated + auto-deployed by the Website tool. Reads the stored
// HTML from the KV store and returns it as a standalone page. This is the "host"
// that makes /api/pixel-pilot/tools/website deploys live and shareable.

import { NextRequest } from 'next/server';
import { get } from '@/pixel-pilot/store';
import type { DeployedSite } from '@/app/api/pixel-pilot/tools/website/route';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await get<DeployedSite>(`pp:site:${slug}`);

  if (!site?.html) {
    return new Response(notFoundHtml(), {
      status: 404,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }

  return new Response(site.html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=60',
    },
  });
}

function notFoundHtml(): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>Site not found</title><style>body{font-family:system-ui,sans-serif;background:#05060f;color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;margin:0}a{color:#00D4FF}</style></head><body><div><h1>404</h1><p>This site isn't hosted here (or the in-memory host restarted).<br>Generate one at <a href="/studio">/studio</a>.</p></div></body></html>`;
}
````
