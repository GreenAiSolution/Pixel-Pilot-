import type { Metadata } from "next";
import { Pricing, FinalCTA } from "@/components/pixel-pilot/sections";

export const metadata: Metadata = {
  title: "Services & Pricing — Pixel Pilot",
  description: "Every service of Pixel Pilot's autonomous media-buying department, priced in plain English. Buy a single deliverable à la carte, or hand us the whole account on a managed flight plan. No retainers you can't explain.",
};

export default function PricingPage() {
  return (
    <>
      <Pricing />
      <FinalCTA />
    </>
  );
}
