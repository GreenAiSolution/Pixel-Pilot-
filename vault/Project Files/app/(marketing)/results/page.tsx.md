---
tags: [phx-growth, source]
file: app/(marketing)/results/page.tsx
---

# `app/(marketing)/results/page.tsx`

Part of [[📁 Codebase]] — live copy at `~/PHX-Growth/app/(marketing)/results/page.tsx`

**Imports** [[Project Files/components/phx-growth/sections.tsx|sections.tsx]]

````tsx
import type { Metadata } from "next";
import { Results, FinalCTA } from "@/components/phx-growth/sections";

export const metadata: Metadata = {
  title: "Results — PHX Growth",
  description: "How PHX Growth brings you more customers and more profit — the mechanism, representative outcomes, before-and-after scenarios, and the risk-free flight check.",
};

export default function ResultsPage() {
  return (
    <>
      <Results />
      <FinalCTA />
    </>
  );
}
````
