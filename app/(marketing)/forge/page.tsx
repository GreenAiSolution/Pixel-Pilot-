import type { Metadata } from "next";
import { Forge, FinalCTA } from "@/components/phx-growth/sections";

export const metadata: Metadata = {
  title: "Creative Forge — PHX Growth",
  description: "Watch the product make the ad, live. The Creative Forge — PHX Growth's render engine — turns your product into scroll-stopping creative on demand, and ships fresh variants faster than fatigue can catch them.",
};

export default function ForgePage() {
  return (
    <>
      <Forge />
      <FinalCTA />
    </>
  );
}
