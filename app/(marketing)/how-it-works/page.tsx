import type { Metadata } from "next";
import { HowPage } from "@/components/phx/pages";

export const metadata: Metadata = {
  title: "How it works — PHX Growth Agentic",
  description:
    "Live on your line in five days, and you do about ten minutes of it. No new number, no porting, nothing to install. You test her yourself before anything goes live.",
};

export default function Page() {
  return <HowPage />;
}
