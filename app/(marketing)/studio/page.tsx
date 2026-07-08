"use client";

// ─── PIXEL PILOT · STUDIO ────────────────────────────────────────────────────
// The working surface for the five services. Pick a tool, fill the brief, run it
// live against /api/pixel-pilot/tools/*. Real output — copy, plans, scores, HTML.

import { useState } from "react";

type Field = { name: string; label: string; placeholder: string; area?: boolean };
type Tool = {
  id: string;
  name: string;
  endpoint: string;
  accent: string;
  blurb: string;
  fields: Field[];
  build?: (v: Record<string, string>) => Record<string, unknown>;
};

const TOOLS: Tool[] = [
  {
    id: "ads",
    name: "Premium AI Ads",
    endpoint: "/api/pixel-pilot/tools/ads",
    accent: "#FF2E9A",
    blurb: "Ad copy + compliance + a visual brief, in one pass.",
    fields: [
      { name: "product", label: "Product", placeholder: "e.g. a clean pre-workout for busy founders" },
      { name: "audience", label: "Audience", placeholder: "DTC founders, 30-45" },
      { name: "angle", label: "Angle", placeholder: "energy without the crash" },
      { name: "platform", label: "Platform", placeholder: "Meta / TikTok / Google" },
    ],
  },
  {
    id: "employees",
    name: "AI Employees",
    endpoint: "/api/pixel-pilot/tools/employees",
    accent: "#6C63FF",
    blurb: "Hire a crew of AI operators + a first-week deployment plan.",
    fields: [
      { name: "business", label: "Business", placeholder: "e.g. a supplements brand doing $80k/mo" },
      { name: "goals", label: "Goals", placeholder: "grow profitably, cut wasted spend" },
    ],
  },
  {
    id: "website",
    name: "Website Creation",
    endpoint: "/api/pixel-pilot/tools/website",
    accent: "#00D4FF",
    blurb: "A complete, responsive, deploy-ready landing page.",
    fields: [
      { name: "business", label: "Business", placeholder: "e.g. an AI bookkeeping service for SMBs" },
      { name: "goal", label: "Goal", placeholder: "book demos" },
      { name: "style", label: "Style", placeholder: "premium, trustworthy, dark" },
    ],
  },
  {
    id: "pretest",
    name: "Synthetic Pre-Testing",
    endpoint: "/api/pixel-pilot/tools/pretest",
    accent: "#C9A84C",
    blurb: "Score ad variants on synthetic buyers before you spend.",
    fields: [
      { name: "product", label: "Product", placeholder: "the product" },
      { name: "audience", label: "Audience", placeholder: "the core buyer" },
      { name: "variants", label: "Ad variants (one per line)", placeholder: "Stop overpaying for ads\nYour dashboard is lying to you", area: true },
    ],
    build: (v) => ({ product: v.product, audience: v.audience, variants: (v.variants || "").split("\n").map((s) => s.trim()).filter(Boolean) }),
  },
  {
    id: "launch",
    name: "Zero-to-Live Plan",
    endpoint: "/api/pixel-pilot/tools/launch-plan",
    accent: "#00D4FF",
    blurb: "A product URL → a complete launch plan.",
    fields: [
      { name: "url", label: "Product URL", placeholder: "https://…" },
      { name: "product", label: "…or product", placeholder: "describe the product" },
      { name: "budget", label: "Monthly budget", placeholder: "$10k/mo" },
    ],
  },
];

export default function StudioPage() {
  const [active, setActive] = useState<Tool>(TOOLS[0]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [err, setErr] = useState<string | null>(null);

  function pick(t: Tool) {
    setActive(t);
    setValues({});
    setResult(null);
    setErr(null);
  }

  async function run() {
    setBusy(true);
    setErr(null);
    setResult(null);
    try {
      const body = active.build ? active.build(values) : values;
      const res = await fetch(active.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Something went wrong");
      setResult(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative px-6 pt-28 pb-28">
      <div className="container mx-auto max-w-6xl">
        <div className="text-xs uppercase tracking-[0.3em] text-[#00D4FF]">── The Studio</div>
        <h1 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight leading-[0.98]">
          Run the{" "}
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg,#00D4FF,#6C63FF,#FF2E9A)" }}>
            five services
          </span>
          .
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-text-secondary">
          Every service is a live tool. Pick one, give it a brief, and get real output back.
        </p>

        <div className="mt-10 grid lg:grid-cols-[300px_1fr] gap-6 items-start">
          {/* Tool list */}
          <div className="space-y-2">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                onClick={() => pick(t)}
                className={`w-full text-left rounded-xl border p-4 transition ${
                  active.id === t.id ? "bg-white/[0.06] border-white/25" : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.accent }} />
                  <span className="text-sm font-semibold">{t.name}</span>
                </div>
                <p className="mt-1.5 text-[13px] text-text-tertiary leading-snug">{t.blurb}</p>
              </button>
            ))}
          </div>

          {/* Runner */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="space-y-4">
              {active.fields.map((f) => (
                <label key={f.name} className="block">
                  <span className="text-xs uppercase tracking-widest text-text-tertiary">{f.label}</span>
                  {f.area ? (
                    <textarea
                      rows={4}
                      value={values[f.name] || ""}
                      onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm outline-none focus:border-white/30"
                    />
                  ) : (
                    <input
                      value={values[f.name] || ""}
                      onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm outline-none focus:border-white/30"
                    />
                  )}
                </label>
              ))}
              <button
                onClick={run}
                disabled={busy}
                className="w-full rounded-lg px-6 py-3 text-sm font-semibold text-white transition disabled:opacity-50"
                style={{ background: "linear-gradient(90deg,#00D4FF,#6C63FF,#FF2E9A)" }}
              >
                {busy ? "Running…" : `Run ${active.name} →`}
              </button>
            </div>

            {err && <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{err}</div>}

            {result != null && (
              <div className="mt-5">
                {typeof result === "object" && result !== null && "live" in result && !(result as { live: boolean }).live && (
                  <div className="mb-3 rounded-lg border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-4 py-2.5 text-[13px] text-[#e6cd7a]">
                    Preview mode — add <code>ANTHROPIC_API_KEY</code> in Vercel to run this live.
                  </div>
                )}
                {(() => {
                  const url = (result as { deployed?: { url?: string } }).deployed?.url;
                  return url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="mb-3 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                      style={{ background: "linear-gradient(90deg,#00D4FF,#6C63FF)" }}
                    >
                      🌐 View your live site →
                    </a>
                  ) : null;
                })()}
                <pre className="max-h-[520px] overflow-auto rounded-lg border border-white/10 bg-black/40 p-4 text-[12.5px] leading-relaxed text-text-secondary whitespace-pre-wrap break-words">
                  {JSON.stringify((result as { result?: unknown }).result ?? result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
