---
tags: [pixel-pilot, source]
file: app/eagle/ops/page.tsx
---

# `app/eagle/ops/page.tsx`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/app/eagle/ops/page.tsx`

`````tsx
import Link from 'next/link';
import { EAGLE, EAGLE_AGENTS, eagleWorkflowsForAgent, quickbooksConfigured, isConnected } from '@/eagle';

export const metadata = {
  title: 'Eagle Ops — Mission Control',
  description: 'The 5 AI employees running Eagle Landscaping, live.',
};

const QB_MSG: Record<string, string> = {
  connected: '✅ QuickBooks connected — new leads now create real customers.',
  denied: 'QuickBooks connection was cancelled.',
  error: 'QuickBooks connection failed — try again.',
  badstate: 'Security check failed — please retry the connection.',
  missing: 'QuickBooks returned no authorization — try again.',
};

export default async function EagleOps({ searchParams }: { searchParams: Promise<{ qb?: string }> }) {
  const { qb } = await searchParams;
  const qbConfigured = quickbooksConfigured();
  const qbConnected = qbConfigured ? await isConnected().catch(() => false) : false;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      {/* QuickBooks connect / status */}
      <div className="mb-6 rounded-2xl border p-5 flex flex-wrap items-center justify-between gap-4"
        style={{ borderColor: qbConnected ? `${EAGLE.forest}44` : '#00000012', background: qbConnected ? EAGLE.sky : 'white' }}>
        <div>
          <div className="flex items-center gap-2 font-semibold" style={{ color: EAGLE.ink }}>
            <span className="text-lg">🧾</span> QuickBooks Online
            <span className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: qbConnected ? EAGLE.forest : '#00000010', color: qbConnected ? 'white' : '#14261A99' }}>
              {qbConnected ? 'Connected' : qbConfigured ? 'Ready to connect' : 'Not configured'}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#14261A]/60">
            {qb && QB_MSG[qb] ? QB_MSG[qb] :
              qbConnected ? 'Quill is booking new leads straight into QuickBooks.' :
              qbConfigured ? 'Click connect and approve in Intuit — one time.' :
              'Add QUICKBOOKS_CLIENT_ID / SECRET / REDIRECT_URI in Vercel, then connect.'}
          </p>
        </div>
        {qbConfigured && !qbConnected && (
          <a href="/api/eagle/quickbooks/connect" className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90" style={{ background: EAGLE.forest }}>
            Connect QuickBooks →
          </a>
        )}
      </div>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm font-semibold uppercase tracking-widest" style={{ color: EAGLE.forest }}>
            Eagle Ops · Mission Control
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold" style={{ color: EAGLE.ink }}>
            5 AI employees, running the business.
          </h1>
          <p className="mt-2 text-[#14261A]/60 max-w-2xl">
            Each specialist works a lane end-to-end — capture, schedule, bill, market, retain — on its
            own cadence, through QuickBooks, Slack, Gmail and the calendar. Here they are, live.
          </p>
        </div>
        <div className="rounded-xl border border-black/[0.07] bg-white px-4 py-3 text-sm">
          <div className="flex items-center gap-2 font-semibold" style={{ color: EAGLE.forest }}>
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping" style={{ background: EAGLE.leaf }} />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: EAGLE.leaf }} />
            </span>
            System nominal
          </div>
          <div className="mt-1 text-[#14261A]/50 text-xs">{EAGLE_AGENTS.length} agents · {EAGLE_AGENTS.length} workflows live</div>
        </div>
      </div>

      {/* Agent cards */}
      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        {EAGLE_AGENTS.map((a) => {
          const wf = eagleWorkflowsForAgent(a.id)[0];
          return (
            <div key={a.id} className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ background: `${a.accent}1a` }}>
                    {a.emoji}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold" style={{ color: EAGLE.ink }}>{a.name}</h3>
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white" style={{ background: a.accent }}>
                        {a.role}
                      </span>
                    </div>
                    <div className="text-sm text-[#14261A]/55">{a.tagline}</div>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: EAGLE.forest }}>
                  <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: EAGLE.leaf }} /> Active
                </span>
              </div>

              <p className="mt-4 text-sm text-[#14261A]/70">{a.specialty}</p>

              {/* KPIs */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                {a.kpis.map((k) => (
                  <div key={k.label} className="rounded-lg px-2 py-2 text-center" style={{ background: EAGLE.sky }}>
                    <div className="text-sm font-bold" style={{ color: a.accent }}>{k.value}</div>
                    <div className="text-[10px] uppercase tracking-wide text-[#14261A]/50">{k.label}</div>
                  </div>
                ))}
              </div>

              {/* Responsibilities */}
              <ul className="mt-4 space-y-1.5">
                {a.responsibilities.slice(0, 3).map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm text-[#14261A]/70">
                    <span className="mt-1.5 h-1 w-1 rounded-full shrink-0" style={{ background: a.accent }} />
                    {r}
                  </li>
                ))}
              </ul>

              {/* Workflow */}
              {wf && (
                <div className="mt-4 rounded-xl border border-black/[0.06] bg-[#FAFBFA] p-3">
                  <div className="text-[10px] uppercase tracking-widest text-[#14261A]/45 mb-2">
                    n8n · {wf.name} · {wf.cadence}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {wf.nodes.map((n, i) => (
                      <span key={n.name} className="flex items-center gap-1.5">
                        <span className="rounded-md border border-black/10 bg-white px-2 py-0.5 text-[11px] text-[#14261A]/70">{n.name}</span>
                        {i < wf.nodes.length - 1 && <span className="text-[#14261A]/30 text-xs">→</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Command */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs text-[#14261A]/50">
                  Runs: <span className="font-medium text-[#14261A]/70">{a.cadence}</span>
                </div>
                <code className="rounded-md bg-[#0F1A12] px-2.5 py-1 text-[11px] text-[#9FE3B0]">@{a.command}</code>
              </div>
            </div>
          );
        })}
      </div>

      {/* How to command */}
      <div className="mt-10 rounded-2xl border border-black/[0.07] p-6" style={{ background: EAGLE.sky }}>
        <h2 className="text-lg font-bold" style={{ color: EAGLE.ink }}>How to command your team</h2>
        <div className="mt-3 grid sm:grid-cols-3 gap-4 text-sm text-[#14261A]/70">
          <div>
            <div className="font-semibold" style={{ color: EAGLE.forest }}>1 · By name</div>
            In Claude Code, invoke a subagent (e.g. <code className="text-xs">@eagle-billing</code>) with a task.
          </div>
          <div>
            <div className="font-semibold" style={{ color: EAGLE.forest }}>2 · On schedule</div>
            Each runs on its own cadence via a daily trigger — no prompting needed.
          </div>
          <div>
            <div className="font-semibold" style={{ color: EAGLE.forest }}>3 · Live events</div>
            A new lead or completed job fires the right workflow instantly.
          </div>
        </div>
        <Link href="/eagle" className="mt-5 inline-block text-sm font-medium" style={{ color: EAGLE.forest }}>← Back to the site</Link>
      </div>
    </div>
  );
}

`````
