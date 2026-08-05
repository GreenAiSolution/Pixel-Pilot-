import type { Metadata } from "next";
import { ReportPage } from "@/components/phx/pages";

export const metadata: Metadata = {
  title: "The monthly report — PHX Growth Agentic",
  description:
    "One page on the 3rd of every month: calls handled, jobs booked, emergencies escalated, and the honest misses. A report with no bad numbers in it stops being read.",
};

export default function Page() {
  return <ReportPage />;
}
