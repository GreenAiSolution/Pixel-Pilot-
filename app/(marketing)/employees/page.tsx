import type { Metadata } from "next";
import { EmployeesPage } from "@/components/phx/pages";
import { Close } from "@/components/phx/agentic";

export const metadata: Metadata = {
  title: "The roster — PHX Growth Agentic",
  description:
    "Ivy answers the phone. Dex runs the day. Rae works the quotes that went quiet. Hire one or the whole front desk — watch each of them work.",
};

export default function Page() {
  return (
    <>
      <EmployeesPage />
      <Close />
    </>
  );
}
