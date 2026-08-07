import type { Metadata } from "next";
import { Results, FinalCTA } from "@/components/phx-growth/sections";

export const metadata: Metadata = {
  title: "Results — PHX Growth",
  description: "How PHX Growth lands more customers and more profit — the mechanism, representative outcomes, and before-and-after scenarios. Measured against your books, not a platform dashboard. Start with the risk-free flight check.",
};

export default function ResultsPage() {
  return (
    <>
      <Results />
      <FinalCTA />
    </>
  );
}
