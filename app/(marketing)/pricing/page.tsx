import type { Metadata } from "next";
import { Pricing, Outcomes, Close } from "@/components/phx/agentic";

export const metadata: Metadata = {
  title: "Pricing — PHX Growth Agentic",
  description:
    "An AI employee who answers every call, books the job and escalates emergencies — $599 to $899 a month. A part-time receptionist costs $2,400 and works 40 of the week's 168 hours.",
};

export default function PricingPage() {
  return (
    <>
      <Pricing />
      <Outcomes />
      <Close />
    </>
  );
}
