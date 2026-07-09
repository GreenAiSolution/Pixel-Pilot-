"use client";

// ─── PIXEL PILOT · HOME ──────────────────────────────────────────────────────
// A lean landing page: the hero, a directory that routes out to every section's
// own page, and the closing CTA. The heavy sections now live on their own routes
// (see components/pixel-pilot/sections.tsx + app/(marketing)/<name>/page.tsx).

import { ConnectionBanner } from "@/components/pixel-pilot/connection-banner";
import { Hero, GrowthEngine, HomeDirectory, FinalCTA } from "@/components/pixel-pilot/sections";

export default function PixelPilotPage() {
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
