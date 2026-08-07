---
tags: [phx-growth, source]
file: app/(marketing)/film/page.tsx
---

# `app/(marketing)/film/page.tsx`

Part of [[📁 Codebase]] — live copy at `~/PHX-Growth/app/(marketing)/film/page.tsx`

**Imports** [[Project Files/components/phx-growth/sections.tsx|sections.tsx]]

````tsx
import type { Metadata } from "next";
import { BrandFilm, FinalCTA } from "@/components/phx-growth/sections";

export const metadata: Metadata = {
  title: "Brand Film — PHX Growth",
  description: "Watch the pilot fly: one pass from PHX Growth turns a struggling shop into a landmark.",
};

export default function FilmPage() {
  return (
    <>
      <BrandFilm />
      <FinalCTA />
    </>
  );
}
````
