import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PIXEL_AGENTS, getPixelAgent, type PixelAgentDomain } from "@/pixel-pilot";
import { AgentChart } from "@/components/pixel-pilot/agent-chart";
import type { ChartMotif } from "@/components/pixel-pilot/agent-scene";

// Each domain reads as a different living shape in 3D.
const MOTIF: Record<PixelAgentDomain, ChartMotif> = {
  Strategy: "radial",
  "Media Buying": "radial",
  Operations: "radial",
  Reputation: "radial",
  Creative: "helix",
  Automation: "helix",
  Search: "helix",
  Economics: "grid",
  Trust: "grid",
  Sales: "grid",
};

const MOTIF_LABEL: Record<ChartMotif, string> = {
  radial: "Radial telemetry",
  helix: "Ascent helix",
  grid: "Signal field",
};

export function generateStaticParams() {
  return PIXEL_AGENTS.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const agent = getPixelAgent(id);
  if (!agent) return { title: "Agent — Pixel Pilot" };
  return {
    title: `${agent.name} · ${agent.role} — Pixel Pilot`,
    description: agent.tagline,
  };
}

function Panel({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-5">
      <div className="text-[10px] uppercase tracking-[0.28em] mb-3" style={{ color: accent }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Bullets({ items, accent }: { items: string[]; accent: string }) {
  return (
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it} className="flex items-start gap-2.5 text-[13px] text-text-secondary leading-relaxed">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: accent }} />
          {it}
        </li>
      ))}
    </ul>
  );
}

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = getPixelAgent(id);
  if (!agent) notFound();

  const motif = MOTIF[agent.domain] ?? "radial";
  const accent = agent.accent;

  return (
    <section className="px-6 pt-24 pb-20">
      <div className="container mx-auto max-w-6xl">
        <Link href="/agents" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-text-tertiary hover:text-text-primary transition">
          ← Agent Crew
        </Link>

        {/* Header */}
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em]" style={{ color: accent }}>
              {agent.domain}
            </div>
            <h1 className="mt-2 text-5xl md:text-6xl font-semibold tracking-tight leading-[0.95]">{agent.name}</h1>
            <div className="mt-2 text-lg" style={{ color: accent }}>
              {agent.role}
            </div>
          </div>
          <span className="rounded-md border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-widest" style={{ color: accent }}>
            {agent.callsign}
          </span>
        </div>
        <p className="mt-4 max-w-2xl text-lg text-text-primary">{agent.tagline}</p>

        {/* Kinetic 3D chart */}
        <div className="relative mt-8 h-[60vh] min-h-[440px] overflow-hidden rounded-3xl border border-white/10 bg-[#05060f]">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(60% 60% at 50% 45%, ${accent}22, transparent 70%)` }}
          />
          <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${accent},transparent)` }} />
          <AgentChart accent={accent} motif={motif} kpiCount={agent.kpis.length} seedKey={agent.id} />

          {/* Overlays */}
          <div className="pointer-events-none absolute left-5 top-5 text-[10px] uppercase tracking-[0.3em] text-text-tertiary">
            {MOTIF_LABEL[motif]} · live
          </div>
          <div className="pointer-events-none absolute inset-x-5 bottom-5 flex flex-wrap gap-2">
            {agent.kpis.map((kpi) => (
              <span key={kpi.label} className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[11px] text-text-secondary backdrop-blur-md">
                <span className="font-semibold" style={{ color: accent }}>
                  {kpi.value}
                </span>{" "}
                {kpi.label}
              </span>
            ))}
          </div>
        </div>

        {/* Intelligence */}
        <p className="mt-8 max-w-3xl text-[15px] leading-relaxed text-text-secondary">{agent.intelligence}</p>

        {/* Detail grid */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Panel title="Responsibilities" accent={accent}>
              <Bullets items={agent.responsibilities} accent={accent} />
            </Panel>
            <Panel title="Decisions it makes" accent={accent}>
              <Bullets items={agent.decisions} accent={accent} />
            </Panel>
            <Panel title="Guardrails" accent={accent}>
              <Bullets items={agent.guardrails} accent={accent} />
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel title="Cadence" accent={accent}>
              <p className="text-sm text-text-primary">{agent.cadence}</p>
            </Panel>
            {agent.workflows.length > 0 && (
              <Panel title="Workflows" accent={accent}>
                <div className="flex flex-wrap gap-2">
                  {agent.workflows.map((w) => (
                    <span key={w} className="rounded-md border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-text-secondary">
                      {w}
                    </span>
                  ))}
                </div>
              </Panel>
            )}
            <Panel title="Integrations" accent={accent}>
              <div className="flex flex-wrap gap-2">
                {agent.integrations.map((it) => (
                  <span key={it} className="rounded-md border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-text-secondary">
                    {it}
                  </span>
                ))}
              </div>
            </Panel>
            <Panel title="Invoke" accent={accent}>
              <code className="text-sm text-text-primary">@{agent.command}</code>
            </Panel>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Link
            href="/automator"
            className="rounded-full px-7 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: `linear-gradient(90deg,${accent},#6C63FF)` }}
          >
            Deploy this crew →
          </Link>
          <Link href="/agents" className="rounded-full border border-white/15 px-7 py-3 text-sm font-medium text-text-primary transition hover:bg-white/5">
            Back to the crew
          </Link>
        </div>
      </div>
    </section>
  );
}
