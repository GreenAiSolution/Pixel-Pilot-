import type { Metadata } from "next";
import { Pricing, FinalCTA } from "@/components/pixel-pilot/sections";

export const metadata: Metadata = {
  title: "Pricing — Pixel Pilot",
  description: "Every Pixel Pilot service priced — buy a single deliverable à la carte, or hand us the whole account with a managed flight plan.",
};

export default function PricingPage() {
  return (
    <>
      <Pricing />
      <FinalCTA />
    </>
  );
}
