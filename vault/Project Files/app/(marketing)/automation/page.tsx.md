---
tags: [phx-growth, source]
file: app/(marketing)/automation/page.tsx
---

# `app/(marketing)/automation/page.tsx`

Part of [[📁 Codebase]] — live copy at `~/PHX-Growth/app/(marketing)/automation/page.tsx`

**Imports** [[Project Files/components/phx-growth/sections.tsx|sections.tsx]]

````tsx
import type { Metadata } from "next";
import { Automation, FinalCTA } from "@/components/phx-growth/sections";

export const metadata: Metadata = {
  title: "Automation — PHX Growth",
  description: "The real n8n workflows behind every decision, plus the zero-to-live flight plan that takes one URL to live ads in under 60 minutes.",
};

export default function AutomationPage() {
  return (
    <>
      <Automation />
      <FinalCTA />
    </>
  );
}
````
