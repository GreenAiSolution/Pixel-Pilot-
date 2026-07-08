---
tags: [pixel-pilot, source]
file: app/(marketing)/page.tsx
---

# `app/(marketing)/page.tsx`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/app/(marketing)/page.tsx`

**Imports** [[Project Files/components/pixel-pilot/connection-banner.tsx|connection-banner.tsx]] · [[Project Files/components/pixel-pilot/sections.tsx|sections.tsx]]

````tsx
"use client";

// ─── PIXEL PILOT · HOME ──────────────────────────────────────────────────────
// A lean landing page: the hero, a directory that routes out to every section's
// own page, and the closing CTA. The heavy sections now live on their own routes
// (see components/pixel-pilot/sections.tsx + app/(marketing)/<name>/page.tsx).

import { ConnectionBanner } from "@/components/pixel-pilot/connection-banner";
import { Hero, HomeDirectory, FinalCTA } from "@/components/pixel-pilot/sections";

export default function PixelPilotPage() {
  return (
    <div className="relative">
      <ConnectionBanner />
      <Hero />
      <HomeDirectory />
      <FinalCTA />
    </div>
  );
}
````
