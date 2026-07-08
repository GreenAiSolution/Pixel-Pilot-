---
tags: [pixel-pilot, source]
file: app/(marketing)/film/page.tsx
---

# `app/(marketing)/film/page.tsx`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/app/(marketing)/film/page.tsx`

````tsx
import type { Metadata } from "next";
import { BrandFilm, FinalCTA } from "@/components/pixel-pilot/sections";

export const metadata: Metadata = {
  title: "Brand Film — Pixel Pilot",
  description: "Watch the pilot fly: one pass from Pixel Pilot turns a struggling shop into a landmark.",
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
