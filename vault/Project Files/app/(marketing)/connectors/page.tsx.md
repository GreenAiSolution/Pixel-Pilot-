---
tags: [pixel-pilot, source]
file: app/(marketing)/connectors/page.tsx
---

# `app/(marketing)/connectors/page.tsx`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/app/(marketing)/connectors/page.tsx`

**Imports** [[Project Files/components/pixel-pilot/sections.tsx|sections.tsx]]

````tsx
import type { Metadata } from "next";
import { Connectors, FinalCTA } from "@/components/pixel-pilot/sections";

export const metadata: Metadata = {
  title: "Connectors — Pixel Pilot",
  description: "Pixel Pilot flies where your money already lives — Meta, Google, TikTok and Shopify, connected with OAuth in a click.",
};

export default function ConnectorsPage() {
  return (
    <>
      <Connectors />
      <FinalCTA />
    </>
  );
}
````
