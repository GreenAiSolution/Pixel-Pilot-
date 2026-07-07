// ─── PIXEL PILOT · THE STACK ─────────────────────────────────────────────────
// The "business brain" page — the full catalog of apps, connectors and tools,
// grouped by function, with live status read from the environment server-side.
// Renders from pixel-pilot/stack.ts (single source of truth).

import type { Metadata } from 'next';
import { stackByCategory, stackStats, toolIsLive, type StackTool, type IntegrationVia } from '@/pixel-pilot';

export const metadata: Metadata = {
  title: 'The Stack — Pixel Pilot',
  description:
    'Pixel Pilot’s business brain: the curated apps, connectors and tools it flies with — advertising, commerce, analytics, CRM, finance, data and more.',
};

const VIA_LABEL: Record<IntegrationVia, string> = {
  native: 'Native',
  zapier: 'Via Zapier',
  mcp: 'Via agent',
  planned: 'On roadmap',
};

function StatusBadge({ tool }: { tool: StackTool }) {
  const live = toolIsLive(tool);
  if (live) {
    const label = !tool.connected && tool.via === 'zapier' ? 'Live · Zapier' : 'Live';
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#22c55e]/40 bg-[#22c55e]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#4ade80]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" /> {label}
      </span>
    );
  }
  const planned = tool.via === 'planned';
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
        planned
          ? 'border-white/10 text-text-tertiary'
          : 'border-white/15 text-text-secondary'
      }`}
    >
      {tool.via === 'native' ? 'Native · add keys' : VIA_LABEL[tool.via]}
    </span>
  );
}

function ToolCard({ tool }: { tool: StackTool }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:-translate-y-0.5 hover:border-white/25">
      <span
        className="absolute inset-x-0 top-0 h-px opacity-60"
        style={{ background: `linear-gradient(90deg,transparent,${tool.hue},transparent)` }}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
            style={{ background: tool.hue }}
          >
            {tool.name[0]}
          </span>
          <span className="truncate text-sm font-semibold">{tool.name}</span>
        </div>
        <StatusBadge tool={tool} />
      </div>
      <p className="mt-2.5 text-[13px] leading-snug text-text-secondary">{tool.blurb}</p>
    </div>
  );
}

export default function StackPage() {
  const groups = stackByCategory();
  const stats = stackStats();

  return (
    <main className="relative">
      {/* HERO */}
      <section className="px-6 pt-28 pb-10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-xs uppercase tracking-[0.3em] text-[#00D4FF]">── The Stack</div>
          <h1 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight leading-[0.98]">
            Pixel Pilot’s{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg,#00D4FF,#6C63FF,#FF2E9A)' }}
            >
              business brain.
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            One command surface across every function — advertising, commerce, attribution, CRM,
            finance and data. Native OAuth for the core, the Zapier bridge to 9,000+ apps for the
            rest, and an agent layer that ties it together.
          </p>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
            {[
              { k: `${stats.total}`, v: 'tools in the brain' },
              { k: `${stats.native}`, v: 'native connectors' },
              { k: `${stats.viaZapier}+`, v: 'via Zapier bridge' },
              { k: `${stats.live}`, v: 'live right now' },
            ].map((s) => (
              <div key={s.v} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div
                  className="text-2xl font-semibold bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(90deg,#00D4FF,#6C63FF,#FF2E9A)' }}
                >
                  {s.k}
                </div>
                <div className="mt-0.5 text-[11px] uppercase tracking-widest text-text-tertiary">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="px-6 pb-28">
        <div className="container mx-auto max-w-6xl space-y-14">
          {groups.map(({ meta, tools }) => (
            <div key={meta.id}>
              <div className="flex items-baseline gap-3 border-b border-white/10 pb-3">
                <h2 className="text-xl font-semibold" style={{ color: meta.hue }}>
                  {meta.id}
                </h2>
                <span className="text-sm text-text-secondary">{meta.summary}</span>
                <span className="ml-auto text-xs text-text-tertiary">{tools.length} tools</span>
              </div>
              <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tools.map((t) => (
                  <ToolCard key={t.id} tool={t} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-32">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Plug in your stack. Let Pixel Pilot fly it.
          </h2>
          <p className="mt-3 text-text-secondary">
            Connect the core in minutes; reach everything else through the Zapier bridge.
          </p>
          <a
            href="/automator"
            className="mt-6 inline-block rounded-full px-7 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: 'linear-gradient(90deg,#6C63FF,#FF2E9A)' }}
          >
            Design your autopilot →
          </a>
        </div>
      </section>
    </main>
  );
}
