---
tags: [pixel-pilot, source]
file: app/(marketing)/automator/page.tsx
---

# `app/(marketing)/automator/page.tsx`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/app/(marketing)/automator/page.tsx`

`````tsx
"use client";

// ─── PIXEL PILOT · THE AUTOMATOR ─────────────────────────────────────────────
// The post-sign-up experience. Not a form — a design studio. Pick any of the ten
// services, then fully customize its automation: trigger, channels, objective,
// autonomy, guardrails, notifications — and watch the workflow graph recompose
// live on the right. Deploy to get a shippable manifest (and a real n8n dry-run
// receipt when the service maps to a workflow).

import { useMemo, useState } from "react";
import {
  SERVICES,
  CONNECTOR_LIST,
  TRIGGERS,
  CADENCES,
  OBJECTIVES,
  buildAutomationGraph,
  defaultConfigFor,
  toManifest,
  type AutomationConfig,
  type Objective,
  type TriggerKind,
  type Service,
} from "@/pixel-pilot";
import { AutomationGraph } from "@/components/pixel-pilot/automation-graph";
import type { ConnectorId } from "@/pixel-pilot";

type Manifest = ReturnType<typeof toManifest>;

const STEPS = ["Select a service", "Design the automation", "Review & deploy"];

export default function AutomatorPage() {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<AutomationConfig | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [zapier, setZapier] = useState<{ configured: boolean; ok: boolean } | null>(null);
  const [qb, setQb] = useState<{ configured: boolean; ok: boolean; detail?: string } | null>(null);
  const [durable, setDurable] = useState<boolean>(false);

  const service = useMemo<Service | undefined>(
    () => SERVICES.find((s) => s.id === config?.serviceId),
    [config?.serviceId]
  );
  const graph = useMemo(() => (config ? buildAutomationGraph(config) : null), [config]);

  function selectService(id: string) {
    setConfig(defaultConfigFor(id));
    setManifest(null);
    setReceipt(null);
    setStep(1);
  }

  function patch(p: Partial<AutomationConfig>) {
    setConfig((c) => (c ? { ...c, ...p } : c));
  }

  function toggleChannel(id: ConnectorId) {
    setConfig((c) => {
      if (!c) return c;
      const on = c.channels.includes(id);
      return { ...c, channels: on ? c.channels.filter((x) => x !== id) : [...c.channels, id] };
    });
  }

  async function deploy() {
    if (!config) return;
    setDeploying(true);
    setReceipt(null);
    setZapier(null);
    setQb(null);
    const m = toManifest(config);

    // One call to the backend: it persists the automation and runs it
    // server-side — the n8n workflow, the Zapier fan-out, and (opt-in) a live
    // QuickBooks check — then returns a receipt per integration. Every step
    // degrades gracefully, so a deploy always resolves.
    try {
      const res = await fetch("/api/pixel-pilot/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manifest: m }),
      });
      const data = await res.json().catch(() => null);
      const receipts: { target: string; configured: boolean; ok: boolean; mode?: string; status?: number; detail?: string }[] =
        data?.automation?.receipts ?? [];
      setDurable(Boolean(data?.durable));

      const n8n = receipts.find((r) => r.target === "n8n");
      if (n8n) setReceipt(n8n.mode ?? (n8n.status ? String(n8n.status) : "accepted"));

      const z = receipts.find((r) => r.target === "zapier");
      if (z) setZapier({ configured: z.configured, ok: z.ok });

      const q = receipts.find((r) => r.target === "quickbooks");
      if (q) setQb({ configured: q.configured, ok: q.ok, detail: q.detail });
    } catch {
      /* non-blocking — still advance so the manifest shows locally */
    }

    setTimeout(() => {
      setManifest(m);
      setDeploying(false);
      setStep(2);
    }, 1100);
  }

  return (
    <div className="relative">
      {/* HEADER */}
      <section className="px-6 pt-24 pb-8">
        <div className="container mx-auto max-w-6xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[#95BF47] animate-pulse" />
            <span className="text-xs uppercase tracking-[0.3em] text-text-secondary">
              Welcome aboard · you&apos;re signed in
            </span>
          </div>
          <h1 className="mt-5 text-4xl md:text-6xl font-semibold tracking-tight leading-[0.98]">
            Design your{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg,#00D4FF,#6C63FF,#FF2E9A)" }}
            >
              autopilot.
            </span>
          </h1>
          <p className="mt-3 text-text-secondary text-lg max-w-2xl">
            Choose any service, tune exactly how it flies, and watch the workflow build itself. Deploy when it looks right — you can change it anytime.
          </p>

          {/* Stepper */}
          <ol className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2">
            {STEPS.map((label, i) => {
              const state = i === step ? "active" : i < step ? "done" : "idle";
              return (
                <li key={label} className="flex items-center gap-3">
                  <button
                    onClick={() => i < step && setStep(i)}
                    disabled={i > step}
                    className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition ${
                      state === "active"
                        ? "border-primary/50 bg-primary/10 text-text-primary"
                        : state === "done"
                          ? "border-white/15 text-text-secondary hover:border-white/30"
                          : "border-white/10 text-text-tertiary"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                        state === "idle" ? "bg-white/10" : "text-white"
                      }`}
                      style={state !== "idle" ? { background: "linear-gradient(135deg,#6C63FF,#FF2E9A)" } : undefined}
                    >
                      {state === "done" ? "✓" : i + 1}
                    </span>
                    {label}
                  </button>
                  {i < STEPS.length - 1 && <span className="text-text-tertiary/50">→</span>}
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* BODY */}
      <section className="px-6 pb-28">
        <div className="container mx-auto max-w-6xl">
          {step === 0 && <ServicePicker onPick={selectService} />}

          {step >= 1 && config && service && graph && (
            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6 items-start">
              {/* LEFT — controls or review */}
              <div className="space-y-5">
                {step === 1 && (
                  <Designer
                    config={config}
                    service={service}
                    patch={patch}
                    toggleChannel={toggleChannel}
                    onBack={() => setStep(0)}
                    onDeploy={deploy}
                    deploying={deploying}
                  />
                )}
                {step === 2 && manifest && (
                  <Review
                    manifest={manifest}
                    receipt={receipt}
                    zapier={zapier}
                    qb={qb}
                    durable={durable}
                    summary={graph.summary}
                    onEdit={() => setStep(1)}
                    onNew={() => {
                      setConfig(null);
                      setManifest(null);
                      setStep(0);
                    }}
                  />
                )}
              </div>

              {/* RIGHT — live graph (sticky) */}
              <div className="lg:sticky lg:top-24">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md p-5">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="text-xs uppercase tracking-[0.3em] text-secondary">Live workflow</div>
                    <div className="text-[11px] text-text-tertiary">{graph.nodeCount} nodes</div>
                  </div>
                  <div className="max-h-[560px] overflow-y-auto pr-1">
                    <AutomationGraph graph={graph} />
                  </div>
                  <p className="mt-4 border-t border-white/10 pt-3 text-[13px] text-text-secondary leading-relaxed">
                    {graph.summary}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// ─── STEP 1 · SERVICE PICKER ──────────────────────────────────────────────────

function ServicePicker({ onPick }: { onPick: (id: string) => void }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.3em] text-[#FF2E9A] mb-4">── Start with a service</div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SERVICES.map((s) => (
          <button
            key={s.id}
            onClick={() => onPick(s.id)}
            className="group relative text-left rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-5 overflow-hidden hover:-translate-y-1 hover:border-white/25 transition"
          >
            <div
              className="absolute inset-x-0 top-0 h-px opacity-60"
              style={{ background: `linear-gradient(90deg,transparent,${s.accent},transparent)` }}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono tracking-widest" style={{ color: s.accent }}>
                {s.no}
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-text-tertiary rounded-full border border-white/10 px-2 py-0.5">
                {s.category}
              </span>
            </div>
            <h3 className="mt-3 text-lg font-semibold leading-tight">{s.name}</h3>
            <p className="mt-1.5 text-[13px] text-text-secondary leading-snug line-clamp-2">{s.headline}</p>
            <div
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium opacity-0 group-hover:opacity-100 transition"
              style={{ color: s.accent }}
            >
              Design its automation →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── STEP 2 · DESIGNER ────────────────────────────────────────────────────────

function Designer({
  config,
  service,
  patch,
  toggleChannel,
  onBack,
  onDeploy,
  deploying,
}: {
  config: AutomationConfig;
  service: Service;
  patch: (p: Partial<AutomationConfig>) => void;
  toggleChannel: (id: ConnectorId) => void;
  onBack: () => void;
  onDeploy: () => void;
  deploying: boolean;
}) {
  return (
    <div className="space-y-5">
      {/* Selected service banner */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white"
            style={{ background: service.accent, boxShadow: `0 0 20px ${service.accent}66` }}
          >
            {service.no}
          </span>
          <div>
            <div className="font-semibold leading-tight">{service.name}</div>
            <div className="text-[11px] uppercase tracking-widest text-text-tertiary">{service.category}</div>
          </div>
        </div>
        <button onClick={onBack} className="text-xs text-text-secondary hover:text-text-primary underline underline-offset-4">
          Change
        </button>
      </div>

      {/* Trigger */}
      <Panel label="When should it run?">
        <div className="grid sm:grid-cols-3 gap-2">
          {TRIGGERS.map((t) => (
            <Choice
              key={t.id}
              active={config.trigger === t.id}
              onClick={() => patch({ trigger: t.id as TriggerKind })}
              title={t.name}
              note={t.note}
            />
          ))}
        </div>
        {config.trigger === "schedule" && (
          <div className="mt-3 flex flex-wrap gap-2">
            {CADENCES.map((c) => (
              <Pill key={c} active={config.cadence === c} onClick={() => patch({ cadence: c })}>
                {c}
              </Pill>
            ))}
          </div>
        )}
      </Panel>

      {/* Channels */}
      <Panel label="Which channels can it fly?">
        <div className="grid sm:grid-cols-2 gap-2">
          {CONNECTOR_LIST.map((c) => {
            const on = config.channels.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggleChannel(c.id)}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition ${
                  on ? "bg-white/[0.05]" : "border-white/10 hover:border-white/25"
                }`}
                style={on ? { borderColor: `${c.hue}66` } : undefined}
              >
                <span
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold text-white shrink-0"
                  style={{ background: c.hue, opacity: on ? 1 : 0.5 }}
                >
                  {c.name[0]}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium leading-tight">{c.name}</span>
                  <span className="block text-[11px] text-text-tertiary truncate">{c.category}</span>
                </span>
                <span
                  className={`ml-auto h-4 w-4 rounded-full border shrink-0 ${on ? "border-transparent" : "border-white/25"}`}
                  style={on ? { background: c.hue } : undefined}
                />
              </button>
            );
          })}
        </div>
      </Panel>

      {/* Objective */}
      <Panel label="What is it optimizing for?">
        <div className="grid sm:grid-cols-2 gap-2">
          {OBJECTIVES.map((o) => (
            <Choice
              key={o.id}
              active={config.objective === o.id}
              onClick={() => patch({ objective: o.id as Objective })}
              title={o.name}
              note={o.note}
              accent={o.accent}
            />
          ))}
        </div>
      </Panel>

      {/* Autonomy + aggression */}
      <Panel label="How hands-off?">
        <Slider
          label="Autonomy"
          hint="How much it may do without a human"
          value={config.autonomy}
          onChange={(v) => patch({ autonomy: v })}
          accent="#00D4FF"
        />
        <Slider
          label="Aggressiveness"
          hint="How hard it scales winners & cuts losers"
          value={config.aggressiveness}
          onChange={(v) => patch({ aggressiveness: v })}
          accent="#FF2E9A"
        />
        <Slider
          label="Max budget shift / run"
          hint="Ceiling on how much it moves at once"
          value={config.maxBudgetShiftPct}
          onChange={(v) => patch({ maxBudgetShiftPct: v })}
          accent="#6C63FF"
          suffix="%"
          max={100}
        />
      </Panel>

      {/* Guardrails + notify */}
      <Panel label="Guardrails & alerts">
        <div className="space-y-2">
          <Switch
            on={config.autoApply}
            onToggle={() => patch({ autoApply: !config.autoApply })}
            title="Auto-apply changes"
            note="Off = it drafts moves for your approval"
          />
          <Switch
            on={config.approvalGate}
            onToggle={() => patch({ approvalGate: !config.approvalGate })}
            title="Human approval gate"
            note="Hold the biggest moves for a person"
          />
          <Switch
            on={config.notifySlack}
            onToggle={() => patch({ notifySlack: !config.notifySlack })}
            title="Slack war-room log"
            note="Post every move as it happens"
          />
          <Switch
            on={config.notifyEmail}
            onToggle={() => patch({ notifyEmail: !config.notifyEmail })}
            title="Email digest"
            note="A daily recap in your inbox"
          />
          <Switch
            on={config.syncQuickbooks}
            onToggle={() => patch({ syncQuickbooks: !config.syncQuickbooks })}
            title="Sync to QuickBooks"
            note="Push results to your connected QuickBooks company"
          />
        </div>
      </Panel>

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={onDeploy}
          disabled={deploying}
          className="flex-1 rounded-lg px-6 py-3.5 text-sm font-semibold text-white transition disabled:opacity-50"
          style={{ background: "linear-gradient(90deg,#00D4FF 0%,#6C63FF 45%,#FF2E9A 100%)" }}
        >
          {deploying ? "Deploying…" : "Deploy this automation →"}
        </button>
        <button onClick={onBack} className="rounded-lg border border-white/15 px-5 py-3.5 text-sm text-text-secondary hover:bg-white/5 transition">
          Back
        </button>
      </div>
    </div>
  );
}

// ─── STEP 3 · REVIEW ──────────────────────────────────────────────────────────

function Review({
  manifest,
  receipt,
  zapier,
  qb,
  durable,
  summary,
  onEdit,
  onNew,
}: {
  manifest: Manifest;
  receipt: string | null;
  zapier: { configured: boolean; ok: boolean } | null;
  qb: { configured: boolean; ok: boolean; detail?: string } | null;
  durable: boolean;
  summary: string;
  onEdit: () => void;
  onNew: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#95BF47]/30 bg-[#95BF47]/[0.06] p-6">
        <div className="flex items-center gap-2 text-[#95BF47]">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#95BF47]/20 text-sm">✓</span>
          <span className="text-sm font-semibold uppercase tracking-[0.2em]">Automation deployed</span>
        </div>
        <h2 className="mt-3 text-2xl font-semibold">{manifest.service} is now flying.</h2>
        <p className="mt-1.5 text-text-secondary text-sm">{summary}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
          <span className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-text-secondary">{manifest.id}</span>
          {manifest.workflowId && (
            <span className="rounded-full border border-secondary/30 px-2.5 py-1 text-secondary">
              n8n · {receipt ? `webhook ${receipt}` : manifest.workflowId}
            </span>
          )}
          {zapier?.configured && zapier.ok && (
            <span className="rounded-full border border-[#FF4F00]/40 bg-[#FF4F00]/10 px-2.5 py-1 text-[#FF7A45]">
              ⚡ Zapier · sent live
            </span>
          )}
          {zapier?.configured && !zapier.ok && (
            <span className="rounded-full border border-error/40 px-2.5 py-1 text-error">⚡ Zapier · hook error</span>
          )}
          {zapier && !zapier.configured && (
            <span className="rounded-full border border-white/15 px-2.5 py-1 text-text-tertiary">
              ⚡ Zapier · set ZAPIER_HOOK_URL to go live
            </span>
          )}
          {qb?.configured && qb.ok && (
            <span className="rounded-full border border-[#2CA01C]/40 bg-[#2CA01C]/10 px-2.5 py-1 text-[#4Fc73a]">
              {qb.detail ?? "QuickBooks · synced"}
            </span>
          )}
          {qb && !qb.configured && (
            <span className="rounded-full border border-white/15 px-2.5 py-1 text-text-tertiary">
              QuickBooks · connect to sync
            </span>
          )}
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-text-tertiary">
            {durable ? "Saved · durable store" : "Saved · in-memory (add KV)"}
          </span>
        </div>
      </div>

      <Panel label="Deployment manifest">
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
          <Row k="Trigger" v={`${manifest.trigger}${manifest.cadence !== "—" ? ` · ${manifest.cadence}` : ""}`} />
          <Row k="Objective" v={manifest.objective} />
          <Row k="Channels" v={manifest.channels.length ? manifest.channels.join(", ") : "none"} />
          <Row k="Autonomy" v={`${manifest.autonomy}%`} />
          <Row k="Aggressiveness" v={`${manifest.aggressiveness}%`} />
          <Row k="Max shift / run" v={`${manifest.maxBudgetShiftPct}%`} />
          <Row k="Auto-apply" v={manifest.autoApply ? "on" : "draft mode"} />
          <Row k="Approval gate" v={manifest.approvalGate ? "on" : "off"} />
          <Row k="Notify" v={manifest.notify.length ? manifest.notify.join(", ") : "none"} />
          <Row k="Webhook" v={manifest.webhookPath ?? "—"} />
        </dl>
      </Panel>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onEdit}
          className="rounded-lg border border-white/15 px-5 py-3 text-sm text-text-primary hover:bg-white/5 transition"
        >
          Tune it
        </button>
        <button
          onClick={onNew}
          className="rounded-lg px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: "linear-gradient(90deg,#6C63FF,#FF2E9A)" }}
        >
          Design another automation →
        </button>
      </div>
    </div>
  );
}

// ─── SMALL UI ─────────────────────────────────────────────────────────────────

function Panel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-5">
      <div className="text-xs uppercase tracking-[0.25em] text-text-tertiary mb-3">{label}</div>
      {children}
    </div>
  );
}

function Choice({
  active,
  onClick,
  title,
  note,
  accent = "#6C63FF",
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  note: string;
  accent?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-2.5 text-left transition ${
        active ? "bg-white/[0.05]" : "border-white/10 text-text-secondary hover:border-white/25"
      }`}
      style={active ? { borderColor: `${accent}66` } : undefined}
    >
      <div className="text-sm font-medium text-text-primary">{title}</div>
      <div className="text-[11px] text-text-tertiary leading-snug mt-0.5">{note}</div>
    </button>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-xs transition ${
        active ? "border-secondary/60 bg-secondary/10 text-text-primary" : "border-white/10 text-text-secondary hover:border-white/25"
      }`}
    >
      {children}
    </button>
  );
}

function Slider({
  label,
  hint,
  value,
  onChange,
  accent,
  suffix = "%",
  max = 100,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
  accent: string;
  suffix?: string;
  max?: number;
}) {
  return (
    <div className="py-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-text-primary">{label}</span>
        <span className="text-sm tabular-nums" style={{ color: accent }}>
          {value}
          {suffix}
        </span>
      </div>
      <div className="text-[11px] text-text-tertiary mb-2">{hint}</div>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full appearance-none h-1.5 rounded-full bg-white/10 outline-none cursor-pointer accent-[var(--accent)]"
        style={{
          ["--accent" as string]: accent,
          background: `linear-gradient(90deg, ${accent} ${(value / max) * 100}%, rgba(255,255,255,0.1) ${(value / max) * 100}%)`,
        }}
      />
    </div>
  );
}

function Switch({ on, onToggle, title, note }: { on: boolean; onToggle: () => void; title: string; note: string }) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-4 rounded-lg border border-white/10 px-3.5 py-2.5 text-left hover:border-white/20 transition"
    >
      <span>
        <span className="block text-sm font-medium text-text-primary">{title}</span>
        <span className="block text-[11px] text-text-tertiary">{note}</span>
      </span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition ${on ? "" : "bg-white/10"}`}
        style={on ? { background: "linear-gradient(90deg,#6C63FF,#FF2E9A)" } : undefined}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${on ? "left-[18px]" : "left-0.5"}`}
        />
      </span>
    </button>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-2">
      <dt className="text-text-tertiary">{k}</dt>
      <dd className="text-text-primary text-right truncate">{v}</dd>
    </div>
  );
}

`````
