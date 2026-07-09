import type { Metadata } from "next";
import { Pricing, FinalCTA } from "@/components/pixel-pilot/sections";

export const metadata: Metadata = {
  title: "Services & Pricing — Pixel Pilot",
  description: "The five services of Pixel Pilot's autonomous media-buying department, and every plan priced — buy a single deliverable à la carte, or hand us the whole account with a managed flight plan.",
};

export default function PricingPage() {
  return (
    <>
      <Pricing />
      <FinalCTA />
    </>
  );
}
