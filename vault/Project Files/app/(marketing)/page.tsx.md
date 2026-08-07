---
tags: [phx-growth, source]
file: app/(marketing)/page.tsx
---

# `app/(marketing)/page.tsx`

Part of [[📁 Codebase]] — live copy at `~/PHX-Growth/app/(marketing)/page.tsx`

**Imports** [[Project Files/components/phx-growth/connection-banner.tsx|connection-banner.tsx]] · [[Project Files/components/phx-growth/sections.tsx|sections.tsx]]

````tsx
"use client";

// ─── PHX GROWTH · HOME ──────────────────────────────────────────────────────
// A lean landing page: the hero, a directory that routes out to every section's
// own page, and the closing CTA. The heavy sections now live on their own routes
// (see components/phx-growth/sections.tsx + app/(marketing)/<name>/page.tsx).

import { ConnectionBanner } from "@/components/phx-growth/connection-banner";
import { Hero, HomeDirectory, FinalCTA } from "@/components/phx-growth/sections";

export default function PHXGrowthPage() {
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
