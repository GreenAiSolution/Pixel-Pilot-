import type { Metadata } from "next";
import { Forge, FinalCTA } from "@/components/pixel-pilot/sections";

export const metadata: Metadata = {
  title: "Creative Forge — Pixel Pilot",
  description: "Watch the product make the ad, live — Pixel Pilot forges scroll-stopping creative on demand.",
};

export default function ForgePage() {
  return (
    <>
      <Forge />
      <FinalCTA />
    </>
  );
}
