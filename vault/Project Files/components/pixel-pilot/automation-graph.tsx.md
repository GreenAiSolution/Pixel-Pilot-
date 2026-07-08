---
tags: [pixel-pilot, source]
file: components/pixel-pilot/automation-graph.tsx
---

# `components/pixel-pilot/automation-graph.tsx`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/components/pixel-pilot/automation-graph.tsx`

````tsx
"use client";

// ─── PIXEL PILOT · LIVE AUTOMATION GRAPH ─────────────────────────────────────
// Renders an AutoGraph as a top-to-bottom flow of stages. A stage with more than
// one node fans out in parallel. Recomposes instantly as the designer changes
// the config — this is the "watch your automation take shape" surface.

import type { AutoGraph, AutoNode, NodeKind } from "@/pixel-pilot";

const KIND_COLOR: Record<NodeKind, string> = {
  trigger: "#00D4FF",
  source: "#1877F2",
  merge: "#95BF47",
  creative: "#FF2E9A",
  logic: "#6C63FF",
  guard: "#FF6B35",
  action: "#8B7FFF",
  notify: "#C9A84C",
};

const KIND_LABEL: Record<NodeKind, string> = {
  trigger: "Trigger",
  source: "Source",
  merge: "Merge",
  creative: "Creative",
  logic: "Decision",
  guard: "Guardrail",
  action: "Action",
  notify: "Notify",
};

function NodeCard({ node }: { node: AutoNode }) {
  const hue = node.hue ?? KIND_COLOR[node.kind];
  return (
    <div
      className="relative w-full max-w-[220px] rounded-xl border bg-black/40 backdrop-blur-md px-3.5 py-2.5 transition"
      style={{ borderColor: `${hue}55`, boxShadow: `0 0 24px -12px ${hue}` }}
    >
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full shrink-0" style={{ background: hue, boxShadow: `0 0 8px ${hue}` }} />
        <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: hue }}>
          {KIND_LABEL[node.kind]}
        </span>
      </div>
      <div className="mt-1 text-sm font-medium text-text-primary leading-tight">{node.label}</div>
      <div className="mt-0.5 text-[11px] text-text-tertiary leading-snug">{node.note}</div>
    </div>
  );
}

function Connector({ fanOut }: { fanOut: boolean }) {
  return (
    <div className="flex flex-col items-center py-1" aria-hidden>
      <span className="block h-5 w-px bg-gradient-to-b from-white/25 to-white/10" />
      <span className="-mt-1 text-white/30 text-xs leading-none">▼</span>
      {fanOut && <span className="mt-0.5 text-[9px] uppercase tracking-[0.25em] text-text-tertiary">parallel</span>}
    </div>
  );
}

export function AutomationGraph({ graph }: { graph: AutoGraph }) {
  if (!graph.stages.length) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] text-sm text-text-tertiary">
        Pick a service to see its automation take shape.
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center">
      {graph.stages.map((stage, i) => (
        <div key={i} className="flex w-full flex-col items-center">
          <div className="flex w-full flex-wrap items-stretch justify-center gap-2.5">
            {stage.map((node) => (
              <NodeCard key={node.id} node={node} />
            ))}
          </div>
          {i < graph.stages.length - 1 && <Connector fanOut={graph.stages[i + 1].length > 1} />}
        </div>
      ))}
    </div>
  );
}
````
