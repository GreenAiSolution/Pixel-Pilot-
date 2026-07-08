---
tags: [pixel-pilot, source]
file: app/(marketing)/automation/page.tsx
---

# `app/(marketing)/automation/page.tsx`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/app/(marketing)/automation/page.tsx`

````tsx
import type { Metadata } from "next";
import { Automation, FinalCTA } from "@/components/pixel-pilot/sections";

export const metadata: Metadata = {
  title: "Automation — Pixel Pilot",
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
