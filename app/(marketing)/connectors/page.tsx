import type { Metadata } from "next";
import { Connectors, FinalCTA } from "@/components/pixel-pilot/sections";

export const metadata: Metadata = {
  title: "Connectors — Pixel Pilot",
  description: "Pixel Pilot flies where your money already lives — Meta, Google, TikTok and Shopify, connected with OAuth in a click.",
};

export default function ConnectorsPage() {
  return (
    <>
      <Connectors />
      <FinalCTA />
    </>
  );
}
