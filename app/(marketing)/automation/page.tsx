import type { Metadata } from "next";
import { Automation, FinalCTA } from "@/components/pixel-pilot/sections";

export const metadata: Metadata = {
  title: "Automation — Pixel Pilot",
  description: "No black box: the real n8n workflows behind every budget move, inspectable node by node — plus the zero-to-live flight plan that takes one URL to live ads in under 60 minutes.",
};

export default function AutomationPage() {
  return (
    <>
      <Automation />
      <FinalCTA />
    </>
  );
}
