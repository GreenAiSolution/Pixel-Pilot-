import type { Metadata } from "next";
import { EmployeePricing, HowItGoesLive, EmployeeCTA } from "@/components/pixel-pilot/employees";

export const metadata: Metadata = {
  title: "Pricing — PHX Growth",
  description:
    "An AI employee who answers every call, books the job and escalates emergencies — from $599/month. A part-time receptionist in Phoenix costs $2,400–$3,200 and works 40 hours of the week's 168. Month to month, cancel any time.",
};

export default function PricingPage() {
  return (
    <>
      <EmployeePricing />
      <HowItGoesLive />
      <EmployeeCTA />
    </>
  );
}
