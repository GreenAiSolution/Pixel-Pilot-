"use client";

// Client wrapper: loads the WebGL scene only in the browser (ssr:false), matching
// the FlightScene pattern. Server pages render <AgentChart/> directly.

import dynamic from "next/dynamic";
import type { AgentSceneProps } from "./agent-scene";

const AgentScene = dynamic(() => import("./agent-scene").then((m) => m.AgentScene), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center text-xs uppercase tracking-[0.25em] text-text-tertiary">
      Spinning up flight chart…
    </div>
  ),
});

export function AgentChart(props: AgentSceneProps) {
  return <AgentScene {...props} />;
}
