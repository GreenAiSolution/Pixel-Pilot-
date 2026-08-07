"use client";

// ─── PHX GROWTH · HOME ──────────────────────────────────────────────────────
// A lean landing page: the hero, a directory that routes out to every section's
// own page, and the closing CTA. The heavy sections now live on their own routes
// (see components/phx-growth/sections.tsx + app/(marketing)/<name>/page.tsx).

import { ConnectionBanner } from "@/components/phx-growth/connection-banner";
import { Hero, GrowthEngine, HomeDirectory, FinalCTA } from "@/components/phx-growth/sections";

export default function PHXGrowthPage() {
  return (
    <div className="relative">
      <ConnectionBanner />
      <Hero />
      <GrowthEngine />
      <HomeDirectory />
      <FinalCTA />
    </div>
  );
}
