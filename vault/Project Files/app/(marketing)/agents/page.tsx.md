---
tags: [phx-growth, source]
file: app/(marketing)/agents/page.tsx
---

# `app/(marketing)/agents/page.tsx`

Part of [[📁 Codebase]] — live copy at `~/PHX-Growth/app/(marketing)/agents/page.tsx`

**Imports** [[Project Files/components/phx-growth/sections.tsx|sections.tsx]]

````tsx
import type { Metadata } from "next";
import { AgentCrew, FinalCTA } from "@/components/phx-growth/sections";

export const metadata: Metadata = {
  title: "Agent Crew — PHX Growth",
  description: "The crew of specialized AI operators that plan, buy, forge creative, check profit, guard policy and run ops — 24/7.",
};

export default function AgentsPage() {
  return (
    <>
      <AgentCrew />
      <FinalCTA />
    </>
  );
}
````
