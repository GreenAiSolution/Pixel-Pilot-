import type { Metadata } from "next";
import { AgentCrew, FinalCTA } from "@/components/pixel-pilot/sections";

export const metadata: Metadata = {
  title: "Agent Crew — Pixel Pilot",
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
