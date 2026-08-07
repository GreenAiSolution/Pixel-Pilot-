import type { Metadata } from "next";
import { Pricing, FinalCTA } from "@/components/phx-growth/sections";

export const metadata: Metadata = {
  title: "Services & Pricing — PHX Growth",
  description: "Every service of PHX Growth's autonomous media-buying department, priced in plain English. Buy a single deliverable à la carte, or hand us the whole account on a managed flight plan. No retainers you can't explain.",
};

export default function PricingPage() {
  return (
    <>
      <Pricing />
      <FinalCTA />
    </>
  );
}
