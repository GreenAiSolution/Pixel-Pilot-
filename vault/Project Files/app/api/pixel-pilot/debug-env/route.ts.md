---
tags: [pixel-pilot, source]
file: app/api/pixel-pilot/debug-env/route.ts
---

# `app/api/pixel-pilot/debug-env/route.ts`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/app/api/pixel-pilot/debug-env/route.ts`

`````ts
// ─── TEMPORARY DIAGNOSTIC — returns env var NAMES only, never values ─────────
// Lists the keys of any KV/Redis/Upstash/Storage-related env vars so we can see
// exactly what the Vercel integration injected and match the store to it. Values
// are never returned. Delete this route once persistence is confirmed durable.

import { NextResponse } from 'next/server';

export async function GET() {
  const keys = Object.keys(process.env)
    .filter((k) => /KV|UPSTASH|REDIS|STORAGE/i.test(k))
    .sort();
  return NextResponse.json({ matchingEnvKeys: keys });
}

`````
