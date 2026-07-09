"use client";

// ─── PIXEL PILOT · GROWTH CALCULATOR ─────────────────────────────────────────
// An interactive, on-theme page: drag the levers and watch the pilot project how
// many NEW customers and leads your spend can buy — before vs. after Pixel Pilot
// tightens CAC and lifts conversion. Pure client math (transparent, no backend),
// every result wired straight into the /book lead flow.

import { useMemo, useState } from "react";
import Link from "next/link";

const GRADIENT = "linear-gradient(90deg,#00D4FF,#6C63FF,#FF2E9A)";

function money(n: number): string {
  return n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `$${Math.round(n)}`;
}
function num(n: number): string {
  return Math.round(n).toLocaleString();
}

// How much Pixel Pilot is modeled to improve the funnel (conservative, honest).
const CAC_IMPROVEMENT = 0.28; // ~28% lower cost per acquisition
const LEAD_LIFT = 0.42; // ~42% more leads from the same spend (better creative + targeting)

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  accent,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  accent: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-text-secondary">{label}</span>
        <span className="text-lg font-semibold tabular-nums" style={{ color: accent }}>
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none"
        style={{ background: `linear-gradient(90deg, ${accent} ${pct}%, rgba(255,255,255,0.1) ${pct}%)` }}
      />
    </div>
  );
}

export default function GrowthPage() {
  const [spend, setSpend] = useState(10000);
  const [cac, setCac] = useState(60);
  const [aov, setAov] = useState(120);
  const [margin, setMargin] = useState(45);

  const model = useMemo(() => {
    const leadRate = 4; // leads per customer (rough top-of-funnel proxy)
    const beforeCustomers = spend / cac;
    const beforeLeads = beforeCustomers * leadRate;
    const beforeRevenue = beforeCustomers * aov;
    const beforeProfit = beforeRevenue * (margin / 100) - spend;

    const afterCac = cac * (1 - CAC_IMPROVEMENT);
    const afterCustomers = spend / afterCac;
    const afterLeads = afterCustomers * leadRate * (1 + LEAD_LIFT);
    const afterRevenue = afterCustomers * aov;
    const afterProfit = afterRevenue * (margin / 100) - spend;

    return {
      before: { customers: beforeCustomers, leads: beforeLeads, revenue: beforeRevenue, profit: beforeProfit, cac },
      after: { customers: afterCustomers, leads: afterLeads, revenue: afterRevenue, profit: afterProfit, cac: afterCac },
      extraCustomers: afterCustomers - beforeCustomers,
      extraLeads: afterLeads - beforeLeads,
      extraProfit: afterProfit - beforeProfit,
    };
  }, [spend, cac, aov, margin]);

  return (
    <div className="relative">
      <section className="px-6 pt-28 pb-12">
        <div className="container mx-auto max-w-3xl text-center space-y-4">
          <div className="text-xs uppercase tracking-[0.3em] text-[#10B981]">── Growth Calculator</div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
            How many customers can
            <br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRADIENT }}>
              your spend actually buy?
            </span>
          </h1>
          <p className="text-text-secondary text-lg">
            Same budget, tighter flying. Drag the levers and watch the pilot project the new
            customers, leads and profit Pixel Pilot can pull from the spend you already have.
          </p>
        </div>
      </section>

      <section className="px-6 pb-28">
        <div className="container mx-auto max-w-6xl grid lg:grid-cols-[0.85fr_1.15fr] gap-6 items-start">
          {/* LEVERS */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-7 space-y-7 lg:sticky lg:top-28">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-text-tertiary mb-1">Your inputs</div>
              <div className="text-sm text-text-secondary">Set these to your business.</div>
            </div>
            <Slider label="Monthly ad spend" value={spend} min={1000} max={200000} step={1000} onChange={setSpend} format={money} accent="#00D4FF" />
            <Slider label="Current cost per customer" value={cac} min={10} max={400} step={5} onChange={setCac} format={money} accent="#6C63FF" />
            <Slider label="Average order value" value={aov} min={20} max={1000} step={10} onChange={setAov} format={money} accent="#FF2E9A" />
            <Slider label="Profit margin" value={margin} min={10} max={90} step={1} onChange={setMargin} format={(v) => `${v}%`} accent="#C9A84C" />
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-[11px] text-text-tertiary leading-relaxed">
              Model assumes ~{Math.round(CAC_IMPROVEMENT * 100)}% lower CAC and ~{Math.round(LEAD_LIFT * 100)}% more leads from
              pre-tested creative + tighter targeting. Illustrative — not a guarantee. Your real numbers depend on offer, margin and market.
            </div>
          </div>

          {/* PROJECTION */}
          <div className="space-y-5">
            {/* Headline deltas */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Delta label="New customers / mo" value={`+${num(model.extraCustomers)}`} sub="vs. today" accent="#10B981" />
              <Delta label="New leads / mo" value={`+${num(model.extraLeads)}`} sub="vs. today" accent="#00D4FF" />
              <Delta label="Added profit / mo" value={`+${money(Math.max(0, model.extraProfit))}`} sub="same budget" accent="#FF2E9A" />
            </div>

            {/* Before / after bars */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-7">
              <div className="text-xs uppercase tracking-[0.25em] text-text-tertiary mb-5">Customers per month</div>
              <CompareBar beforeVal={model.before.customers} afterVal={model.after.customers} unit="customers" />
              <div className="mt-8 text-xs uppercase tracking-[0.25em] text-text-tertiary mb-5">Leads per month</div>
              <CompareBar beforeVal={model.before.leads} afterVal={model.after.leads} unit="leads" accent="#00D4FF" />
            </div>

            {/* Numbers grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <NumberCard title="Today" tone="muted" cac={money(model.before.cac)} customers={num(model.before.customers)} revenue={money(model.before.revenue)} />
              <NumberCard title="With Pixel Pilot" tone="bright" cac={money(model.after.cac)} customers={num(model.after.customers)} revenue={money(model.after.revenue)} />
            </div>

            {/* CTA */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-7 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div>
                <div className="text-lg font-semibold">Want these numbers on your account?</div>
                <div className="text-sm text-text-secondary">Get a custom flight plan built for your niche — free.</div>
              </div>
              <Link href="/book" className="shrink-0 rounded-full px-7 py-3 text-sm font-semibold text-white transition hover:opacity-90" style={{ background: "linear-gradient(90deg,#6C63FF,#FF2E9A)" }}>
                Get my growth plan →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Delta({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-5">
      <div className="text-3xl font-bold tabular-nums" style={{ color: accent }}>
        {value}
      </div>
      <div className="mt-1 text-sm font-medium">{label}</div>
      <div className="text-[11px] text-text-tertiary">{sub}</div>
    </div>
  );
}

function CompareBar({ beforeVal, afterVal, unit, accent = "#10B981" }: { beforeVal: number; afterVal: number; unit: string; accent?: string }) {
  const max = Math.max(beforeVal, afterVal) || 1;
  return (
    <div className="space-y-3">
      <Row label="Today" val={beforeVal} max={max} unit={unit} color="rgba(255,255,255,0.18)" text="text-text-secondary" />
      <Row label="Pixel Pilot" val={afterVal} max={max} unit={unit} color={accent} text="text-text-primary" glow />
    </div>
  );
}

function Row({ label, val, max, unit, color, text, glow }: { label: string; val: number; max: number; unit: string; color: string; text: string; glow?: boolean }) {
  const pct = Math.max(4, (val / max) * 100);
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs text-text-tertiary">{label}</span>
        <span className={`text-sm font-semibold tabular-nums ${text}`}>
          {num(val)} <span className="text-[11px] font-normal text-text-tertiary">{unit}</span>
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-black/30">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, background: color, boxShadow: glow ? `0 0 18px ${color}` : undefined }}
        />
      </div>
    </div>
  );
}

function NumberCard({ title, tone, cac, customers, revenue }: { title: string; tone: "muted" | "bright"; cac: string; customers: string; revenue: string }) {
  const bright = tone === "bright";
  return (
    <div className={`rounded-2xl border p-5 ${bright ? "border-white/25 bg-white/[0.05]" : "border-white/10 bg-white/[0.02]"}`}>
      <div className={`text-xs uppercase tracking-[0.25em] ${bright ? "text-[#10B981]" : "text-text-tertiary"}`}>{title}</div>
      <dl className="mt-3 space-y-2 text-sm">
        {[
          ["Cost / customer", cac],
          ["Customers / mo", customers],
          ["Revenue / mo", revenue],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between">
            <dt className="text-text-tertiary">{k}</dt>
            <dd className="font-semibold tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
