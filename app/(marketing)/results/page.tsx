import type { Metadata } from "next";
import { Results, FinalCTA } from "@/components/pixel-pilot/sections";

export const metadata: Metadata = {
  title: "Results — Pixel Pilot",
  description: "How Pixel Pilot lands more customers and more profit — the mechanism, representative outcomes, and before-and-after scenarios. Measured against your books, not a platform dashboard. Start with the risk-free flight check.",
};

export default function ResultsPage() {
  return (
    <>
      <Results />
      <FinalCTA />
    </>
  );
}
