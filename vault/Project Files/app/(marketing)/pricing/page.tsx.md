---
tags: [pixel-pilot, source]
file: app/(marketing)/pricing/page.tsx
---

# `app/(marketing)/pricing/page.tsx`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/app/(marketing)/pricing/page.tsx`

**Imports** [[Project Files/components/pixel-pilot/sections.tsx|sections.tsx]]

````tsx
import type { Metadata } from "next";
import { Pricing, FinalCTA } from "@/components/pixel-pilot/sections";

export const metadata: Metadata = {
  title: "Pricing — Pixel Pilot",
  description: "Every Pixel Pilot service priced — buy a single deliverable à la carte, or hand us the whole account with a managed flight plan.",
};

export default function PricingPage() {
  return (
    <>
      <Pricing />
      <FinalCTA />
    </>
  );
}
````
