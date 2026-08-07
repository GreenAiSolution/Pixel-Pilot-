---
tags: [phx-growth, source]
file: app/(marketing)/connectors/page.tsx
---

# `app/(marketing)/connectors/page.tsx`

Part of [[📁 Codebase]] — live copy at `~/PHX-Growth/app/(marketing)/connectors/page.tsx`

**Imports** [[Project Files/components/phx-growth/sections.tsx|sections.tsx]]

````tsx
import type { Metadata } from "next";
import { Connectors, FinalCTA } from "@/components/phx-growth/sections";

export const metadata: Metadata = {
  title: "Connectors — PHX Growth",
  description: "PHX Growth flies where your money already lives — Meta, Google, TikTok and Shopify, connected with OAuth in a click.",
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
