---
tags: [phx-growth, source]
file: app/(marketing)/forge/page.tsx
---

# `app/(marketing)/forge/page.tsx`

Part of [[📁 Codebase]] — live copy at `~/PHX-Growth/app/(marketing)/forge/page.tsx`

**Imports** [[Project Files/components/phx-growth/sections.tsx|sections.tsx]]

````tsx
import type { Metadata } from "next";
import { Forge, FinalCTA } from "@/components/phx-growth/sections";

export const metadata: Metadata = {
  title: "Creative Forge — PHX Growth",
  description: "Watch the product make the ad, live — PHX Growth fires Higgsfield to forge scroll-stopping creative on demand.",
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
