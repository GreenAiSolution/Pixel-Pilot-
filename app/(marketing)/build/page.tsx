import type { Metadata } from "next";
import { Designer } from "@/components/phx/designer";

export const metadata: Metadata = {
  title: "Build your own employee — PHX Growth Agentic",
  description:
    "Name it, pick what it handles, tell it about your shop — then watch it take a call using your own settings. Five minutes, no card, no call required.",
};

export default function Page() {
  return (
    <>
      <section className="ag-section ag-section--tight">
        <div className="ag-shell">
          <span className="ag-mono ag-eyebrow">The workshop</span>
          <h1 className="ag-h1">
            Build the employee
            <br />
            <span className="ag-h1__accent">you actually need.</span>
          </h1>
          <p className="ag-lede ag-lede--wide">
            Name it. Pick what it takes off your plate. Then hear it answer a
            call as your shop, in your trade, before you talk to anyone.
          </p>
        </div>
      </section>
      <Designer />
    </>
  );
}
