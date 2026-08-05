import type { Metadata } from "next";
import { PricingPage } from "@/components/phx/pricing";
import { Close } from "@/components/phx/agentic";

export const metadata: Metadata = {
  title: "Pricing — PHX Growth Agentic",
  description:
    "Four plans from $349.99. Front Office puts three AI employees on your front desk for $2,190 — less than one part-time receptionist who works 40 of the week's 168 hours.",
};

export default function Page() {
  return (
    <>
      <PricingPage />
      <Close />
    </>
  );
}
