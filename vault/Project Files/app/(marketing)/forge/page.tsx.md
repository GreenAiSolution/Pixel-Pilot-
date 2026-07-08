---
tags: [pixel-pilot, source]
file: app/(marketing)/forge/page.tsx
---

# `app/(marketing)/forge/page.tsx`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/app/(marketing)/forge/page.tsx`

**Imports** [[Project Files/components/pixel-pilot/sections.tsx|sections.tsx]]

````tsx
import type { Metadata } from "next";
import { Forge, FinalCTA } from "@/components/pixel-pilot/sections";

export const metadata: Metadata = {
  title: "Creative Forge — Pixel Pilot",
  description: "Watch the product make the ad, live — Pixel Pilot fires Higgsfield to forge scroll-stopping creative on demand.",
};

export default function ForgePage() {
  return (
    <>
      <Forge />
      <FinalCTA />
    </>
  );
}
````
