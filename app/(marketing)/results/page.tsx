import type { Metadata } from "next";
import { Results, FinalCTA } from "@/components/pixel-pilot/sections";

export const metadata: Metadata = {
  title: "Results — Pixel Pilot",
  description: "How Pixel Pilot brings you more customers and more profit — the mechanism, representative outcomes, before-and-after scenarios, and the risk-free flight check.",
};

export default function ResultsPage() {
  return (
    <>
      <Results />
      <FinalCTA />
    </>
  );
}
