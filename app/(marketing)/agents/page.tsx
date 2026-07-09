import type { Metadata } from "next";
import { AgentCrew, FinalCTA } from "@/components/pixel-pilot/sections";

export const metadata: Metadata = {
  title: "Agent Crew — Pixel Pilot",
  description: "One flight deck, a full crew: specialized AI operators that plan the strategy, buy the media, forge the creative, verify profit against your books, guard policy and run ops — 24/7, no handoffs.",
};

export default function AgentsPage() {
  return (
    <>
      <AgentCrew />
      <FinalCTA />
    </>
  );
}
