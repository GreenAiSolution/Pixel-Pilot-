---
tags: [phx-growth, source]
file: app/(marketing)/pricing/page.tsx
---

# `app/(marketing)/pricing/page.tsx`

Part of [[📁 Codebase]] — live copy at `~/PHX-Growth/app/(marketing)/pricing/page.tsx`

**Imports** [[Project Files/components/phx-growth/sections.tsx|sections.tsx]]

````tsx
import type { Metadata } from "next";
import { Pricing, FinalCTA } from "@/components/phx-growth/sections";

export const metadata: Metadata = {
  title: "Pricing — PHX Growth",
  description: "Every PHX Growth service priced — buy a single deliverable à la carte, or hand us the whole account with a managed flight plan.",
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
