import type { Metadata } from "next";
import { FlightDeck, FinalCTA } from "@/components/pixel-pilot/sections";

export const metadata: Metadata = {
  title: "Flight Deck — Pixel Pilot",
  description: "The five services of Pixel Pilot's autonomous media-buying department — Premium AI Ads, AI Employees, Website Creation, Synthetic Pre-Testing and the Zero-to-Live launch.",
};

export default function ServicesPage() {
  return (
    <>
      <FlightDeck />
      <FinalCTA />
    </>
  );
}
