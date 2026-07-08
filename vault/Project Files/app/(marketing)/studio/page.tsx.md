---
tags: [pixel-pilot, source]
file: app/(marketing)/studio/page.tsx
---

# `app/(marketing)/studio/page.tsx`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/app/(marketing)/studio/page.tsx`

````tsx
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
// Result renderers below consume free-form JSON returned by the model, so the
// shape is intentionally `any` at the render boundary (validated by the UI).

// ─── PIXEL PILOT · STUDIO ────────────────────────────────────────────────────
// The luxury working surface. Eight live tools, each with a deluxe, detailed
// brief so you get the *exact* product you need — and a guided Workflow that
// chains them end-to-end: every hand-off is one button, all inside the site.
//
// Tools run live against /api/pixel-pilot/tools/*. Results render as real,
// finished products (palettes, calendars, pricing tables, a live site) — and
// each one hands its context forward to the next step in the flight plan.

import { useCallback, useMemo, useState } from "react";

/* ── Field system ─────────────────────────────────────────────────────────── */
type Field =
  | { name: string; label: string; kind?: "text" | "area"; placeholder?: string; hint?: string }
  | { name: string; label: string; kind: "select"; options: string[]; hint?: string }
  | { name: string; label: string; kind: "chips"; options: string[]; hint?: string };

type Tool = {
  id: string;
  name: string;
  category: string;
  endpoint: string;
  accent: string;
  icon: string;
  blurb: string;
  cta: string;
  fields: Field[];
  build?: (v: Record<string, string>) => Record<string, unknown>;
};

/* ── The roster ───────────────────────────────────────────────────────────── */
const TOOLS: Tool[] = [
  {
    id: "launch",
    name: "Zero-to-Live Plan",
    category: "Strategy",
    endpoint: "/api/pixel-pilot/tools/launch-plan",
    accent: "#00D4FF",
    icon: "◎",
    blurb: "A product or URL → a complete, profit-first launch plan.",
    cta: "Build the launch plan",
    fields: [
      { name: "url", label: "Product URL", placeholder: "https://…", hint: "Paste a store or product page — or describe it below." },
      { name: "product", label: "…or describe the product", kind: "area", placeholder: "What it is, who it's for, why it's different" },
      { name: "budget", label: "Monthly budget", kind: "select", options: ["$2k/mo", "$5k/mo", "$10k/mo", "$25k/mo", "$50k+/mo"] },
      { name: "market", label: "Market", kind: "chips", options: ["US", "UK", "EU", "Global"] },
    ],
    build: (v) => ({ url: v.url, product: [v.product, v.market ? `Market: ${v.market}` : ""].filter(Boolean).join(". "), budget: v.budget }),
  },
  {
    id: "brand",
    name: "Brand Identity Kit",
    category: "Strategy",
    endpoint: "/api/pixel-pilot/tools/brand",
    accent: "#C9A84C",
    icon: "❖",
    blurb: "Name, tagline, positioning, a real color system + voice.",
    cta: "Design the brand",
    fields: [
      { name: "business", label: "Business", placeholder: "e.g. an AI bookkeeping service for SMBs" },
      { name: "vibe", label: "Vibe", kind: "chips", options: ["Premium & sleek", "Playful & bold", "Trusted & clean", "Luxury", "Techy & futuristic", "Warm & human"] },
      { name: "audience", label: "Audience", placeholder: "who it's for" },
      { name: "name", label: "Working name (optional)", placeholder: "leave blank to have one named for you" },
    ],
    build: (v) => ({ business: v.business, vibe: v.vibe, audience: v.audience, name: v.name }),
  },
  {
    id: "funnel",
    name: "Offer & Funnel Architect",
    category: "Strategy",
    endpoint: "/api/pixel-pilot/tools/funnel",
    accent: "#6C63FF",
    icon: "⧉",
    blurb: "An irresistible offer — value stack, tiers, guarantee, funnel.",
    cta: "Architect the offer",
    fields: [
      { name: "product", label: "Product / service", placeholder: "what you're selling" },
      { name: "price", label: "Price point", kind: "select", options: ["Under $50", "$50–$200", "$200–$500", "$500–$2k", "$2k+", "Subscription"] },
      { name: "audience", label: "Audience", placeholder: "the core buyer" },
      { name: "goal", label: "Primary goal", kind: "chips", options: ["Max conversions", "Higher AOV", "Recurring revenue", "Lead-gen"] },
    ],
    build: (v) => ({ product: v.product, price: v.price, audience: v.audience, goal: v.goal }),
  },
  {
    id: "website",
    name: "Website Creation",
    category: "Build",
    endpoint: "/api/pixel-pilot/tools/website",
    accent: "#00D4FF",
    icon: "▤",
    blurb: "A complete, responsive, deploy-ready landing page — live.",
    cta: "Generate the site",
    fields: [
      { name: "business", label: "Business", placeholder: "e.g. an AI bookkeeping service for SMBs" },
      { name: "goal", label: "Primary goal", kind: "select", options: ["Book demos", "Sell a product", "Collect leads", "Launch a waitlist", "Drive app installs"] },
      { name: "style", label: "Style", kind: "chips", options: ["Premium dark", "Clean & light", "Bold & loud", "Editorial", "Minimal", "Luxury"] },
      { name: "colors", label: "Brand colors (optional)", placeholder: "e.g. cyan, violet, deep navy" },
      { name: "sections", label: "Must-have sections", placeholder: "hero, features, pricing, FAQ, CTA" },
    ],
    build: (v) => ({
      business: v.business,
      goal: v.goal,
      style: [v.style, v.colors ? `Colors: ${v.colors}` : ""].filter(Boolean).join(". "),
      sections: (v.sections || "").split(",").map((s) => s.trim()).filter(Boolean),
    }),
  },
  {
    id: "ads",
    name: "Premium AI Ads",
    category: "Build",
    endpoint: "/api/pixel-pilot/tools/ads",
    accent: "#FF2E9A",
    icon: "✦",
    blurb: "Ad copy + compliance + a visual brief, in one pass.",
    cta: "Write the ad",
    fields: [
      { name: "product", label: "Product", placeholder: "e.g. a clean pre-workout for busy founders" },
      { name: "audience", label: "Audience", placeholder: "DTC founders, 30–45" },
      { name: "angle", label: "Angle", placeholder: "energy without the crash" },
      { name: "platform", label: "Platform", kind: "select", options: ["Meta", "TikTok", "Google", "YouTube", "LinkedIn"] },
      { name: "tone", label: "Tone", kind: "chips", options: ["Bold", "Playful", "Premium", "Urgent", "Empathetic", "Data-driven"] },
      { name: "format", label: "Format", kind: "chips", options: ["Single image", "Video script", "Carousel", "Story"] },
    ],
    build: (v) => ({
      product: v.product,
      audience: v.audience,
      angle: [v.angle, v.tone ? `Tone: ${v.tone}` : "", v.format ? `Format: ${v.format}` : ""].filter(Boolean).join(". "),
      platform: v.platform,
    }),
  },
  {
    id: "content",
    name: "Content Engine",
    category: "Build",
    endpoint: "/api/pixel-pilot/tools/content",
    accent: "#FF2E9A",
    icon: "◈",
    blurb: "A ready-to-post content calendar — hook, caption, CTA per day.",
    cta: "Fill the calendar",
    fields: [
      { name: "business", label: "Business", placeholder: "what you post about" },
      { name: "platform", label: "Platform", kind: "select", options: ["Instagram", "TikTok", "LinkedIn", "X / Twitter", "Facebook", "YouTube Shorts"] },
      { name: "days", label: "Length", kind: "chips", options: ["3 days", "7 days", "14 days"] },
      { name: "goal", label: "Goal", kind: "select", options: ["Grow the audience", "Drive sales", "Launch a product", "Build authority"] },
      { name: "tone", label: "Tone", kind: "chips", options: ["Confident", "Playful", "Premium", "Educational", "Raw & real"] },
    ],
    build: (v) => ({
      business: v.business,
      platform: v.platform,
      goal: v.goal,
      tone: v.tone,
      days: parseInt(v.days || "7", 10) || 7,
    }),
  },
  {
    id: "pretest",
    name: "Synthetic Pre-Testing",
    category: "Optimize",
    endpoint: "/api/pixel-pilot/tools/pretest",
    accent: "#C9A84C",
    icon: "◉",
    blurb: "Score ad variants on synthetic buyers before you spend.",
    cta: "Run the pre-test",
    fields: [
      { name: "product", label: "Product", placeholder: "the product" },
      { name: "audience", label: "Audience", placeholder: "the core buyer" },
      { name: "variants", label: "Ad variants (one per line)", kind: "area", placeholder: "Stop overpaying for ads\nYour dashboard is lying to you" },
    ],
    build: (v) => ({ product: v.product, audience: v.audience, variants: (v.variants || "").split("\n").map((s) => s.trim()).filter(Boolean) }),
  },
  {
    id: "employees",
    name: "AI Employees",
    category: "Optimize",
    endpoint: "/api/pixel-pilot/tools/employees",
    accent: "#6C63FF",
    icon: "❈",
    blurb: "Hire a crew of AI operators + a first-week deployment plan.",
    cta: "Hire the crew",
    fields: [
      { name: "business", label: "Business", placeholder: "e.g. a supplements brand doing $80k/mo" },
      { name: "goals", label: "Goals", kind: "area", placeholder: "grow profitably, cut wasted spend" },
      { name: "stage", label: "Stage", kind: "chips", options: ["Pre-launch", "Scaling", "Established"] },
    ],
    build: (v) => ({ business: v.business, goals: [v.goals, v.stage ? `Stage: ${v.stage}` : ""].filter(Boolean).join(". ") }),
  },
];

const CATEGORIES = ["Strategy", "Build", "Optimize"] as const;

/* The guided flight plan — the recommended end-to-end order. */
const FLOW = ["launch", "brand", "funnel", "website", "ads", "content", "pretest", "employees"];

const GRADIENT = "linear-gradient(90deg,#00D4FF,#6C63FF,#FF2E9A)";
const byId = (id: string) => TOOLS.find((t) => t.id === id)!;

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function StudioPage() {
  const [activeId, setActiveId] = useState<string>(FLOW[0]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  // One result kept per tool so the workflow can show progress + hand off.
  const [results, setResults] = useState<Record<string, any>>({});
  // The accumulating project context that flows from tool to tool.
  const [project, setProject] = useState<Record<string, string>>({});

  const active = byId(activeId);
  const result = results[activeId] ?? null;

  const flowIndex = FLOW.indexOf(activeId);
  const nextId = flowIndex >= 0 && flowIndex < FLOW.length - 1 ? FLOW[flowIndex + 1] : null;

  const set = useCallback((name: string, val: string) => setValues((v) => ({ ...v, [name]: val })), []);

  /* Switch tools, optionally pre-filling from carried context. */
  const pick = useCallback(
    (id: string, prefill?: Record<string, string>) => {
      setActiveId(id);
      setErr(null);
      setValues((prev) => ({ ...seedFor(id, project), ...(results[id] ? prev : {}), ...(prefill || {}) }));
    },
    [project, results],
  );

  async function run() {
    setBusy(true);
    setErr(null);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 75000);
    try {
      const body = active.build ? active.build(values) : values;
      const res = await fetch(active.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Something went wrong");
      setResults((r) => ({ ...r, [active.id]: data }));
      setProject((p) => absorb(p, active.id, values, data));
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") setErr("That took too long. Try a shorter brief, or run it again.");
      else setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      clearTimeout(timer);
      setBusy(false);
    }
  }

  const done = useMemo(() => FLOW.filter((id) => results[id]).length, [results]);

  return (
    <main className="relative px-5 pt-28 pb-28 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-xs uppercase tracking-[0.3em] text-[#00D4FF]">── The Studio</div>
        <h1 className="mt-4 text-4xl font-semibold leading-[0.98] tracking-tight md:text-6xl">
          Build the exact{" "}
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRADIENT }}>
            thing you need
          </span>
          .
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-text-secondary">
          Eight deluxe tools, each with a detailed brief so nothing comes back generic. Run them one at a time — or follow the
          Flight Plan and let each step hand its work to the next. Everything ships from inside this page.
        </p>

        {/* Flight Plan — the guided workflow rail */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs uppercase tracking-[0.25em] text-[#C9A84C]">✦ Flight Plan — end-to-end workflow</div>
            <div className="text-xs text-text-tertiary">
              {done}/{FLOW.length} complete
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {FLOW.map((id, i) => {
              const t = byId(id);
              const isDone = Boolean(results[id]);
              const isActive = id === activeId;
              return (
                <button
                  key={id}
                  onClick={() => pick(id)}
                  className={`group flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] transition ${
                    isActive ? "border-white/40 bg-white/[0.08]" : "border-white/10 hover:border-white/25"
                  }`}
                >
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                    style={{ background: isDone ? t.accent : "rgba(255,255,255,0.08)", color: isDone ? "#05060f" : "#8890A0" }}
                  >
                    {isDone ? "✓" : i + 1}
                  </span>
                  <span className={isActive ? "font-semibold" : "text-text-secondary"}>{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Body: tool rail + runner */}
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[320px_1fr]">
          {/* Tool rail, grouped by category */}
          <div className="space-y-5">
            {CATEGORIES.map((cat) => (
              <div key={cat}>
                <div className="mb-2 px-1 text-[11px] uppercase tracking-[0.25em] text-text-tertiary">{cat}</div>
                <div className="space-y-2">
                  {TOOLS.filter((t) => t.category === cat).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => pick(t.id)}
                      className={`w-full rounded-xl border p-3.5 text-left transition ${
                        active.id === t.id ? "border-white/25 bg-white/[0.06]" : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm"
                          style={{ background: `${t.accent}22`, color: t.accent }}
                        >
                          {t.icon}
                        </span>
                        <span className="text-sm font-semibold">{t.name}</span>
                        {results[t.id] && <span className="ml-auto text-[11px] text-[#10B981]">ready ✓</span>}
                      </div>
                      <p className="mt-1.5 text-[12.5px] leading-snug text-text-tertiary">{t.blurb}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Runner */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-5 flex items-start gap-3 border-b border-white/10 pb-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl text-lg" style={{ background: `${active.accent}22`, color: active.accent }}>
                {active.icon}
              </span>
              <div>
                <div className="text-lg font-semibold">{active.name}</div>
                <div className="text-[13px] text-text-tertiary">{active.blurb}</div>
              </div>
            </div>

            {/* Brief */}
            <div className="space-y-4">
              {active.fields.map((f) => (
                <FieldInput key={f.name} field={f} value={values[f.name] || ""} accent={active.accent} onChange={(val) => set(f.name, val)} />
              ))}

              <button
                onClick={run}
                disabled={busy}
                className="w-full rounded-lg px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                style={{ background: GRADIENT }}
              >
                {busy ? "Running…" : `${active.cta} →`}
              </button>
              {busy && <p className="text-center text-xs text-text-tertiary">Generating with Claude — this can take up to a minute. Don&apos;t close the tab.</p>}
            </div>

            {err && <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{err}</div>}

            {/* Result */}
            {result != null && (
              <div className="mt-6 border-t border-white/10 pt-6">
                {"live" in result && !result.live && (
                  <div className="mb-4 rounded-lg border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-4 py-2.5 text-[13px] text-[#e6cd7a]">
                    Preview mode — add <code>ANTHROPIC_API_KEY</code> in Vercel to run this live.
                  </div>
                )}

                <ResultView tool={active} data={result} />

                {/* Cross-tool hand-offs — the workflow, one button each */}
                <HandOffs current={active.id} project={project} results={results} onGo={pick} />

                {/* Continue down the flight plan */}
                {nextId && (
                  <button
                    onClick={() => pick(nextId)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold transition hover:border-white/30"
                  >
                    Continue to {byId(nextId).name}
                    <span style={{ color: byId(nextId).accent }}>→</span>
                  </button>
                )}

                <details className="mt-4 text-text-tertiary">
                  <summary className="cursor-pointer text-xs uppercase tracking-widest">Raw output</summary>
                  <pre className="mt-2 max-h-[320px] overflow-auto rounded-lg border border-white/10 bg-black/40 p-4 text-[12px] whitespace-pre-wrap break-words">
                    {JSON.stringify(result.result ?? result, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ── Field renderer ───────────────────────────────────────────────────────── */
function FieldInput({ field, value, accent, onChange }: { field: Field; value: string; accent: string; onChange: (v: string) => void }) {
  const kind = "kind" in field ? field.kind : "text";
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-text-tertiary">{field.label}</span>
      {kind === "chips" && "options" in field ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {field.options.map((opt) => {
            const on = value === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(on ? "" : opt)}
                className="rounded-full border px-3 py-1.5 text-[12.5px] transition"
                style={on ? { borderColor: accent, background: `${accent}22`, color: "#F8F9FF" } : { borderColor: "rgba(255,255,255,0.12)", color: "#8890A0" }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      ) : kind === "select" && "options" in field ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm outline-none focus:border-white/30"
        >
          <option value="">Choose…</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : kind === "area" ? (
        <textarea
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={"placeholder" in field ? field.placeholder : ""}
          className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm outline-none focus:border-white/30"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={"placeholder" in field ? field.placeholder : ""}
          className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm outline-none focus:border-white/30"
        />
      )}
      {"hint" in field && field.hint && <span className="mt-1 block text-[11px] text-text-tertiary">{field.hint}</span>}
    </label>
  );
}

/* ── Result views — real, finished products per tool ──────────────────────── */
function ResultView({ tool, data }: { tool: Tool; data: any }) {
  const r = data.result ?? {};
  switch (tool.id) {
    case "brand":
      return <BrandView r={r} />;
    case "content":
      return <ContentView r={r} />;
    case "funnel":
      return <FunnelView r={r} />;
    case "pretest":
      return <PretestView r={r} />;
    case "ads":
      return <AdsView r={r} />;
    case "website":
      return <WebsiteView data={data} r={r} />;
    case "launch":
      return <LaunchView r={r} />;
    case "employees":
      return <EmployeesView data={data} r={r} />;
    default:
      return <RawView r={r} />;
  }
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-5">
    <div className="mb-2 text-xs uppercase tracking-widest text-text-tertiary">{title}</div>
    {children}
  </div>
);

function BrandView({ r }: { r: any }) {
  return (
    <div>
      <div className="text-2xl font-semibold">{r.name}</div>
      {r.tagline && <div className="mt-1 text-lg text-text-secondary">“{r.tagline}”</div>}
      {r.positioning && <p className="mt-3 text-sm text-text-secondary">{r.positioning}</p>}
      {Array.isArray(r.palette) && (
        <Section title="Color system">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {r.palette.map((s: any, i: number) => (
              <div key={i} className="overflow-hidden rounded-lg border border-white/10">
                <div className="h-12 w-full" style={{ background: s.hex }} />
                <div className="px-2.5 py-1.5">
                  <div className="text-[12px] font-medium">{s.name}</div>
                  <div className="text-[11px] uppercase text-text-tertiary">{s.hex}</div>
                  {s.use && <div className="text-[11px] text-text-tertiary">{s.use}</div>}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
      {r.fonts && (
        <Section title="Type">
          <div className="text-sm text-text-secondary">
            Headings — <span className="text-text-primary">{r.fonts.heading}</span> · Body — <span className="text-text-primary">{r.fonts.body}</span>
          </div>
        </Section>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.isArray(r.voice) && (
          <Section title="Voice">
            <ul className="space-y-1 text-sm text-text-secondary">{r.voice.map((v: string, i: number) => <li key={i}>• {v}</li>)}</ul>
          </Section>
        )}
        {Array.isArray(r.dos) && (
          <Section title="Do / Don't">
            <ul className="space-y-1 text-sm">
              {r.dos.map((v: string, i: number) => <li key={`d${i}`} className="text-[#10B981]">✓ {v}</li>)}
              {Array.isArray(r.donts) && r.donts.map((v: string, i: number) => <li key={`x${i}`} className="text-text-tertiary">✕ {v}</li>)}
            </ul>
          </Section>
        )}
      </div>
    </div>
  );
}

function ContentView({ r }: { r: any }) {
  return (
    <div>
      {r.theme && <p className="mb-4 text-sm text-text-secondary">{r.theme}</p>}
      <div className="space-y-2.5">
        {Array.isArray(r.calendar) &&
          r.calendar.map((p: any, i: number) => (
            <div key={i} className="rounded-xl border border-white/10 bg-black/20 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-text-secondary">{p.day}</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-text-tertiary">{p.format}</span>
              </div>
              <div className="mt-1.5 text-sm font-medium">{p.hook}</div>
              <p className="mt-1 text-[13px] text-text-secondary">{p.caption}</p>
              {p.cta && <div className="mt-1.5 text-[12px] text-[#00D4FF]">{p.cta}</div>}
            </div>
          ))}
      </div>
      {Array.isArray(r.hashtags) && (
        <Section title="Hashtags">
          <div className="mt-1 flex flex-wrap gap-1.5">
            {r.hashtags.map((h: string, i: number) => (
              <span key={i} className="rounded-full border border-white/10 px-2 py-0.5 text-[12px] text-text-tertiary">#{h}</span>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function FunnelView({ r }: { r: any }) {
  return (
    <div>
      <div className="text-xl font-semibold">{r.offerName}</div>
      {r.promise && <p className="mt-1 text-sm text-text-secondary">{r.promise}</p>}
      {Array.isArray(r.valueStack) && (
        <Section title="Value stack">
          <div className="rounded-lg border border-white/10">
            {r.valueStack.map((v: any, i: number) => (
              <div key={i} className="flex items-center justify-between border-b border-white/5 px-3 py-2 text-sm last:border-0">
                <span className="text-text-secondary">{v.item}</span>
                <span className="text-text-tertiary">{v.value}</span>
              </div>
            ))}
          </div>
        </Section>
      )}
      {Array.isArray(r.pricing) && (
        <Section title="Pricing">
          <div className="grid gap-2.5 sm:grid-cols-3">
            {r.pricing.map((t: any, i: number) => (
              <div key={i} className={`rounded-xl border p-3.5 ${t.best ? "border-[#6C63FF]/60 bg-[#6C63FF]/10" : "border-white/10"}`}>
                {t.best && <div className="mb-1 text-[10px] uppercase tracking-widest text-[#6C63FF]">Best value</div>}
                <div className="text-sm font-semibold">{t.tier}</div>
                <div className="text-lg font-bold">{t.price}</div>
                {Array.isArray(t.includes) && <ul className="mt-1.5 space-y-0.5 text-[12px] text-text-secondary">{t.includes.map((x: string, j: number) => <li key={j}>• {x}</li>)}</ul>}
              </div>
            ))}
          </div>
        </Section>
      )}
      {r.guarantee && (
        <Section title="Guarantee">
          <p className="text-sm text-text-secondary">{r.guarantee}</p>
        </Section>
      )}
      {Array.isArray(r.funnelSteps) && (
        <Section title="The funnel">
          <ol className="space-y-1.5 text-sm text-text-secondary">
            {r.funnelSteps.map((s: any, i: number) => (
              <li key={i}>
                <span className="text-text-primary">{s.step}</span> — {s.detail}
              </li>
            ))}
          </ol>
        </Section>
      )}
    </div>
  );
}

function PretestView({ r }: { r: any }) {
  return (
    <div>
      {Array.isArray(r.personas) && (
        <Section title="Synthetic buyers">
          <ul className="space-y-1 text-sm text-text-secondary">{r.personas.map((p: string, i: number) => <li key={i}>• {p}</li>)}</ul>
        </Section>
      )}
      <Section title="Ranked variants">
        <div className="space-y-2.5">
          {Array.isArray(r.ranked) &&
            r.ranked.map((s: any, i: number) => {
              const color = s.verdict === "launch" ? "#10B981" : s.verdict === "iterate" ? "#F59E0B" : "#EF4444";
              return (
                <div key={i} className="rounded-xl border border-white/10 bg-black/20 p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm">{s.variant}</span>
                    <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase" style={{ background: `${color}22`, color }}>
                      {s.verdict}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: color }} />
                  </div>
                  <div className="mt-1.5 flex gap-4 text-[11px] text-text-tertiary">
                    <span>Score {s.score}</span>
                    <span>Scroll-stop {s.scrollStop}</span>
                    <span>Clarity {s.clarity}</span>
                    <span>Intent {s.clickIntent}</span>
                  </div>
                  {s.why && <p className="mt-1.5 text-[12px] text-text-secondary">{s.why}</p>}
                </div>
              );
            })}
        </div>
      </Section>
    </div>
  );
}

function AdsView({ r }: { r: any }) {
  return (
    <div className="space-y-3">
      {r.hook && <div className="text-lg font-semibold">{r.hook}</div>}
      {r.primaryText && <p className="text-sm text-text-secondary">{r.primaryText}</p>}
      <div className="flex flex-wrap gap-4 text-sm">
        {r.headline && (
          <div>
            <span className="text-[11px] uppercase text-text-tertiary">Headline</span>
            <div>{r.headline}</div>
          </div>
        )}
        {r.cta && (
          <div>
            <span className="text-[11px] uppercase text-text-tertiary">CTA</span>
            <div>{r.cta}</div>
          </div>
        )}
      </div>
      {r.compliance && (
        <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[12px]">
          <span className="uppercase tracking-widest text-text-tertiary">Compliance</span> —{" "}
          <span style={{ color: r.compliance.verdict === "clear" ? "#10B981" : r.compliance.verdict === "block" ? "#EF4444" : "#F59E0B" }}>{r.compliance.verdict}</span>
          <span className="text-text-secondary"> · {r.compliance.notes}</span>
        </div>
      )}
      {r.visualBrief && (
        <Section title="Visual brief">
          <p className="text-sm text-text-secondary">{r.visualBrief}</p>
        </Section>
      )}
    </div>
  );
}

function WebsiteView({ data, r }: { data: any; r: any }) {
  const url = data.deployed?.url;
  if (!r.html) return <RawView r={r} />;
  return (
    <div className="space-y-3">
      <div className="text-xs uppercase tracking-widest text-text-tertiary">Live preview</div>
      <div className="overflow-hidden rounded-xl border border-white/15 bg-white">
        <iframe title="Live preview" srcDoc={r.html} className="block h-[620px] w-full" sandbox="allow-scripts allow-same-origin" />
      </div>
      {url && (
        <a href={url} target="_blank" rel="noreferrer" className="inline-flex text-sm text-[#00D4FF] hover:underline">
          Open the live site in a new tab ↗
        </a>
      )}
    </div>
  );
}

function LaunchView({ r }: { r: any }) {
  return (
    <div>
      {Array.isArray(r.research) && (
        <Section title="Research">
          <ul className="space-y-1 text-sm text-text-secondary">{r.research.map((x: string, i: number) => <li key={i}>• {x}</li>)}</ul>
        </Section>
      )}
      {Array.isArray(r.personas) && (
        <Section title="Personas">
          <ul className="space-y-1 text-sm text-text-secondary">{r.personas.map((x: string, i: number) => <li key={i}>• {x}</li>)}</ul>
        </Section>
      )}
      {Array.isArray(r.channelPlan) && (
        <Section title="Channel + budget">
          <div className="space-y-2">
            {r.channelPlan.map((c: any, i: number) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm">
                  <span>{c.channel}</span>
                  <span className="text-text-tertiary">{c.percent}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full" style={{ width: `${c.percent}%`, background: GRADIENT }} />
                </div>
                {c.why && <p className="mt-0.5 text-[12px] text-text-tertiary">{c.why}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}
      {Array.isArray(r.creativeConcepts) && (
        <Section title="Creative concepts">
          <ul className="space-y-1 text-sm text-text-secondary">{r.creativeConcepts.map((x: string, i: number) => <li key={i}>• {x}</li>)}</ul>
        </Section>
      )}
      {Array.isArray(r.trackingChecklist) && (
        <Section title="Tracking checklist">
          <ul className="space-y-1 text-sm text-text-secondary">{r.trackingChecklist.map((x: string, i: number) => <li key={i}>☐ {x}</li>)}</ul>
        </Section>
      )}
    </div>
  );
}

function EmployeesView({ data, r }: { data: any; r: any }) {
  const hired = data.hired ?? [];
  const plan = data.plan ?? r;
  return (
    <div>
      {Array.isArray(hired) && hired.length > 0 && (
        <Section title="Crew hired">
          <div className="grid gap-2 sm:grid-cols-2">
            {hired.map((a: any) => (
              <div key={a.id} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                <div className="text-sm font-medium">{a.name}</div>
                <div className="text-[12px] text-text-tertiary">{a.role}</div>
              </div>
            ))}
          </div>
        </Section>
      )}
      {plan?.cadence && (
        <Section title="Cadence">
          <div className="text-sm text-text-secondary">{plan.cadence} · reports to {plan.reportsTo}</div>
        </Section>
      )}
      {Array.isArray(plan?.firstWeek) && (
        <Section title="First week">
          <ol className="space-y-1 text-sm text-text-secondary">{plan.firstWeek.map((x: string, i: number) => <li key={i}>{i + 1}. {x}</li>)}</ol>
        </Section>
      )}
    </div>
  );
}

function RawView({ r }: { r: any }) {
  return (
    <pre className="max-h-[520px] overflow-auto rounded-lg border border-white/10 bg-black/40 p-4 text-[12.5px] leading-relaxed text-text-secondary whitespace-pre-wrap break-words">
      {JSON.stringify(r, null, 2)}
    </pre>
  );
}

/* ── Hand-offs: the workflow buttons that carry context forward ───────────── */
function HandOffs({ current, project, results, onGo }: { current: string; project: Record<string, string>; results: Record<string, any>; onGo: (id: string, prefill?: Record<string, string>) => void }) {
  const links = HANDOFF_MAP[current] || [];
  if (!links.length) return null;
  return (
    <div className="mt-5">
      <div className="mb-2 text-[11px] uppercase tracking-widest text-text-tertiary">Take it further — one button</div>
      <div className="flex flex-wrap gap-2">
        {links.map((to) => {
          const t = byId(to);
          return (
            <button
              key={to}
              onClick={() => onGo(to, seedFor(to, project))}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-[13px] transition hover:border-white/30"
              style={{ background: `${t.accent}12` }}
            >
              <span style={{ color: t.accent }}>{t.icon}</span>
              {results[to] ? `Update ${t.name}` : `Send to ${t.name}`}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* Which tools each result can flow into. */
const HANDOFF_MAP: Record<string, string[]> = {
  launch: ["brand", "funnel", "website"],
  brand: ["website", "ads", "content"],
  funnel: ["website", "ads", "pretest"],
  website: ["ads", "content", "employees"],
  ads: ["pretest", "content"],
  content: ["ads", "employees"],
  pretest: ["ads", "employees"],
  employees: [],
};

/* ── Context carry ────────────────────────────────────────────────────────── */
/* Pull useful facts out of a run into the shared project context. */
function absorb(prev: Record<string, string>, id: string, values: Record<string, string>, data: any): Record<string, string> {
  const next = { ...prev };
  const r = data?.result ?? {};
  if (values.business) next.business = values.business;
  if (values.product) next.product = values.product;
  if (values.audience) next.audience = values.audience;
  if (id === "brand" && r.name) {
    next.business = r.name;
    if (Array.isArray(r.palette)) next.colors = r.palette.slice(0, 3).map((s: any) => s.name).join(", ");
  }
  if (id === "funnel" && r.offerName) next.product = next.product || r.offerName;
  return next;
}

/* Seed a tool's fields from the project context when it becomes active. */
function seedFor(id: string, p: Record<string, string>): Record<string, string> {
  const subject = p.business || p.product || "";
  switch (id) {
    case "brand":
      return { business: p.business || p.product || "", audience: p.audience || "" };
    case "funnel":
      return { product: p.product || p.business || "", audience: p.audience || "" };
    case "website":
      return { business: subject, colors: p.colors || "" };
    case "ads":
      return { product: p.product || subject, audience: p.audience || "" };
    case "content":
      return { business: subject };
    case "pretest":
      return { product: p.product || subject, audience: p.audience || "" };
    case "employees":
      return { business: subject };
    case "launch":
      return { product: p.product || "" };
    default:
      return {};
  }
}
````
