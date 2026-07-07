// ─── PIXEL PILOT · RUNNERS MISSION CONTROL ───────────────────────────────────
// A lightweight, static server component that renders the three autonomous
// backend runners (Atlas · Iris · Ledger) straight from the registry in
// pixel-pilot/runners.ts. No client fetch, no 3D — just a clean flight deck that
// shows who's flying, on what cadence, through which pipes, and how to command
// each one. Durability is read from the store so you can tell live from dev.

import Link from 'next/link';
import { PIXEL_PILOT, PIXEL_PILOT_RUNNERS, runnersDurable } from '@/pixel-pilot';

export const metadata = {
  title: 'Pixel Pilot Ops — Runners Mission Control',
  description: 'Atlas, Iris & Ledger — the three autonomous backend runners flying Pixel Pilot, live.',
};

export default function PixelPilotOps() {
  const durable = runnersDurable();

  return (
    <div className="min-h-screen bg-[#070A18] text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-semibold uppercase tracking-widest" style={{ color: PIXEL_PILOT.hues.cyan }}>
              Pixel Pilot Ops · Mission Control
            </div>
            <h1
              className="mt-2 text-3xl sm:text-4xl font-bold"
              style={{ backgroundImage: PIXEL_PILOT.gradient, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}
            >
              3 autonomous runners, flying the account.
            </h1>
            <p className="mt-3 max-w-2xl text-white/60">
              Each runner works a lane end-to-end — buy, create, report — on its own cron cadence,
              reasoning over the store and firing real side-effects through n8n and Zapier. They think,
              decide, act, and stage the irreversible for a human.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
            <div className="flex items-center gap-2 font-semibold" style={{ color: PIXEL_PILOT.hues.cyan }}>
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: PIXEL_PILOT.hues.cyan }} />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: PIXEL_PILOT.hues.cyan }} />
              </span>
              Systems nominal
            </div>
            <div className="mt-1 text-xs text-white/45">
              {PIXEL_PILOT_RUNNERS.length} runners · store {durable ? 'durable (KV)' : 'in-memory (dev)'}
            </div>
          </div>
        </div>

        {/* Runner cards */}
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {PIXEL_PILOT_RUNNERS.map((r) => (
            <div key={r.id} className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ background: `${r.accent}22` }}>
                    {r.emoji}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold">{r.name}</h3>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-black" style={{ background: r.accent }}>
                      {r.role}
                    </span>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: r.accent }}>
                  <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: r.accent }} /> Active
                </span>
              </div>

              <div className="mt-3 text-sm font-medium" style={{ color: r.accent }}>{r.tagline}</div>
              <p className="mt-3 text-sm text-white/65">{r.specialty}</p>

              {/* KPIs */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {r.kpis.map((k) => (
                  <span key={k} className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-white/70">
                    {k}
                  </span>
                ))}
              </div>

              {/* Responsibilities */}
              <ul className="mt-4 space-y-1.5">
                {r.responsibilities.slice(0, 4).map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-white/65">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: r.accent }} />
                    {item}
                  </li>
                ))}
              </ul>

              {/* Integrations */}
              <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="mb-2 text-[10px] uppercase tracking-widest text-white/40">Pipes it flies</div>
                <div className="flex flex-wrap gap-1.5">
                  {r.integrations.map((intg) => (
                    <span key={intg} className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-white/70">
                      {intg}
                    </span>
                  ))}
                </div>
              </div>

              {/* Command + endpoint */}
              <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4 text-xs text-white/50">
                <div>Cadence: <span className="font-medium text-white/75">{r.cadence}</span></div>
                <code className="truncate rounded-md bg-black/40 px-2.5 py-1 text-[11px]" style={{ color: r.accent }}>
                  {r.endpoint}
                </code>
                <code className="w-fit rounded-md bg-black/40 px-2.5 py-1 text-[11px] text-white/70">@{r.command}</code>
              </div>
            </div>
          ))}
        </div>

        {/* How to command */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-bold">How to command the runners</h2>
          <div className="mt-3 grid gap-4 text-sm text-white/65 sm:grid-cols-3">
            <div>
              <div className="font-semibold" style={{ color: PIXEL_PILOT.hues.cyan }}>1 · By name</div>
              In Claude Code, invoke a subagent (e.g. <code className="text-xs">@pp-atlas</code>) with a task.
            </div>
            <div>
              <div className="font-semibold" style={{ color: PIXEL_PILOT.hues.violet }}>2 · On cron</div>
              Vercel Cron GETs each endpoint on its cadence — they run themselves, no prompt needed.
            </div>
            <div>
              <div className="font-semibold" style={{ color: PIXEL_PILOT.hues.magenta }}>3 · On demand</div>
              <code className="text-xs">POST</code> the endpoint with a <code className="text-xs">payload</code> to run one now.
            </div>
          </div>
          <Link href="/" className="mt-5 inline-block text-sm font-medium" style={{ color: PIXEL_PILOT.hues.cyan }}>
            ← Back to the site
          </Link>
        </div>
      </div>
    </div>
  );
}
