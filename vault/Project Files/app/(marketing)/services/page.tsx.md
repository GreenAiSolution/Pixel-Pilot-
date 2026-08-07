---
tags: [phx-growth, source]
file: app/(marketing)/services/page.tsx
---

# `app/(marketing)/services/page.tsx`

Part of [[📁 Codebase]] — live copy at `~/PHX-Growth/app/(marketing)/services/page.tsx`

**Imports** [[Project Files/components/phx-growth/sections.tsx|sections.tsx]]

````tsx
import type { Metadata } from "next";
import { FlightDeck, FinalCTA } from "@/components/phx-growth/sections";

export const metadata: Metadata = {
  title: "Flight Deck — PHX Growth",
  description: "The five services of PHX Growth's autonomous media-buying department — Premium AI Ads, AI Employees, Website Creation, Synthetic Pre-Testing and the Zero-to-Live launch.",
};

export default function ServicesPage() {
  return (
    <>
      <FlightDeck />
      <FinalCTA />
    </>
  );
}
````
