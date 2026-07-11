"use client";

// ─── PIXEL PILOT · ORBITAL CRM DECK ──────────────────────────────────────────
// The client command surface. Talks to /api/pixel-pilot/crm/* — the roster is
// persisted server-side (durable when KV is wired), the integration mesh is
// resolved from the project's live configuration, and every acquisition fans
// out through the Zapier/n8n spine. Pure client component; all data over HTTP.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PIPELINE,
  CLIENT_SOURCES,
  type CrmClient,
  type CrmSummary,
  type IntegrationInfo,
  type StageId,
  type ClientSource,
} from "@/pixel-pilot/crm-shared";
import { PIXEL_AGENTS } from "@/pixel-pilot/agents";

const GRAD = "linear-gradient(90deg,#00D4FF,#6C63FF,#FF2E9A)";

const money = (n?: number) =>
  n === undefined || n === null
    ? "—"
    : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const timeAgo = (iso: string) => {
  const mins = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
};

const SOURCE_LABEL: Record<ClientSource, string> = {
  moneygun: "MoneyGun",
  "cold-call": "Cold Call",
  inbound: "Inbound",
  referral: "Referral",
  manual: "Manual",
};

const stageOf = (id: StageId) => PIPELINE.find((s) => s.id === id) ?? PIPELINE[0];
const nextStage = (id: StageId): StageId | null => {
  const order = PIPELINE.filter((s) => !s.terminal);
  const i = order.findIndex((s) => s.id === id);
  return i >= 0 && i < order.length - 1 ? order[i + 1].id : null;
};

interface Receipt {
  target: string;
  configured: boolean;
  ok: boolean;
  detail: string;
}

// ─── ROOT ────────────────────────────────────────────────────────────────────

export function CrmDeck() {
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [summary, setSummary] = useState<CrmSummary | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationInfo[]>([]);
  const [stageFilter, setStageFilter] = useState<StageId | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [receipts, setReceipts] = useState<Receipt[] | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/pixel-pilot/crm/clients", { cache: "no-store" });
      const data = await res.json();
      if (data.ok) {
        setClients(data.clients ?? []);
        setSummary(data.summary ?? null);
      }
    } catch {
      /* transient — deck keeps last known state */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Mount-time fetch-and-sync from the server — the canonical use of an
    // effect, not derivable during render, so the setState-in-effect rule is
    // a false positive here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    fetch("/api/pixel-pilot/crm/integrations", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => d.ok && setIntegrations(d.integrations ?? []))
      .catch(() => {});
  }, [refresh]);

  const patchClient = useCallback(
    async (id: string, patch: Record<string, unknown>) => {
      await fetch(`/api/pixel-pilot/crm/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      }).catch(() => {});
      await refresh();
    },
    [refresh]
  );

  const removeClient = useCallback(
    async (id: string) => {
      await fetch(`/api/pixel-pilot/crm/clients/${id}`, { method: "DELETE" }).catch(() => {});
      setExpanded(null);
      await refresh();
    },
    [refresh]
  );

  const roster = useMemo(
    () => (stageFilter ? clients.filter((c) => c.stage === stageFilter) : clients),
    [clients, stageFilter]
  );

  return (
    <div className="container mx-auto px-6 pt-16 pb-24 space-y-14">
      <DeckHeader durable={summary?.durable ?? false} />
      <CommandStrip summary={summary} />
      <PipelineRail summary={summary} active={stageFilter} onSelect={setStageFilter} />
      <IntegrationMesh integrations={integrations} />

      <section className="space-y-5">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-text-tertiary">Roster</div>
            <h2 className="text-2xl font-semibold">
              {stageFilter ? `${stageOf(stageFilter).label} · ${roster.length}` : `All Clients · ${roster.length}`}
            </h2>
          </div>
          {stageFilter && (
            <button
              onClick={() => setStageFilter(null)}
              className="text-xs uppercase tracking-widest text-text-secondary hover:text-text-primary border border-white/10 rounded-full px-4 py-1.5 transition"
            >
              Clear filter ✕
            </button>
          )}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-12 text-center text-text-secondary animate-pulse">
            Scanning the client field…
          </div>
        ) : roster.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
            <div className="text-text-secondary">No contacts on this vector.</div>
            <div className="text-text-tertiary text-sm mt-1">Acquire your first client in the dock below ↓</div>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {roster.map((c) => (
              <ClientCard
                key={c.id}
                client={c}
                integrations={integrations}
                expanded={expanded === c.id}
                onToggle={() => setExpanded(expanded === c.id ? null : c.id)}
                onPatch={patchClient}
                onDelete={removeClient}
              />
            ))}
          </div>
        )}
      </section>

      <AcquisitionDock
        integrations={integrations}
        onCreated={(r) => {
          setReceipts(r);
          refresh();
        }}
      />

      {receipts && <ReceiptToast receipts={receipts} onClose={() => setReceipts(null)} />}
    </div>
  );
}

// ─── HEADER ──────────────────────────────────────────────────────────────────

function DeckHeader({ durable }: { durable: boolean }) {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-10 backdrop-blur-md">
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[120%] -translate-x-1/2 opacity-20 blur-3xl"
        style={{ background: GRAD }}
        aria-hidden
      />
      <div className="relative space-y-3">
        <div className="text-xs uppercase tracking-[0.35em] text-text-tertiary">Client Command · Orbital CRM</div>
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
          Every client.{" "}
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRAD }}>
            Every pipe.
          </span>{" "}
          One deck.
        </h1>
        <p className="max-w-2xl text-text-secondary">
          The roster Pixel Pilot flies for — tracked from first radar blip to permanent orbit, wired into the
          connector fleet, the agent squadron, and the Zapier / n8n automation spine.
        </p>
        <div className="flex items-center gap-2 pt-1 text-xs uppercase tracking-widest">
          <span
            className={`inline-block h-2 w-2 rounded-full ${durable ? "bg-emerald-400" : "bg-amber-400"} animate-pulse`}
          />
          <span className="text-text-tertiary">
            {durable ? "Persistence: durable (KV wired)" : "Persistence: in-memory — connect KV for durability"}
          </span>
        </div>
      </div>
    </header>
  );
}

// ─── COMMAND STRIP ───────────────────────────────────────────────────────────

function CommandStrip({ summary }: { summary: CrmSummary | null }) {
  const tiles = [
    { label: "Clients on Deck", value: summary ? String(summary.totalClients) : "—" },
    { label: "In-Flight / Orbit", value: summary ? String(summary.activeClients) : "—" },
    { label: "Retainer MRR", value: summary ? money(summary.monthlyRetainer) : "—" },
    { label: "Spend Under Mgmt", value: summary ? money(summary.spendUnderManagement) : "—" },
    { label: "Avg Health", value: summary ? `${summary.avgHealth}` : "—" },
    { label: "Pipes Linked", value: summary ? String(summary.integrationsLinked) : "—" },
  ];
  return (
    <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-md">
          <div className="text-2xl font-semibold tabular-nums">{t.value}</div>
          <div className="mt-1 text-[11px] uppercase tracking-widest text-text-tertiary">{t.label}</div>
        </div>
      ))}
    </section>
  );
}

// ─── PIPELINE RAIL ───────────────────────────────────────────────────────────

function PipelineRail({
  summary,
  active,
  onSelect,
}: {
  summary: CrmSummary | null;
  active: StageId | null;
  onSelect: (s: StageId | null) => void;
}) {
  return (
    <section className="space-y-3">
      <div className="text-xs uppercase tracking-[0.3em] text-text-tertiary">Flight Path</div>
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
        {PIPELINE.map((s) => {
          const count = summary?.byStage?.[s.id] ?? 0;
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(isActive ? null : s.id)}
              title={s.description}
              className={`group relative rounded-xl border px-4 py-3 text-left transition backdrop-blur-md ${
                isActive ? "border-white/30 bg-white/[0.07]" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
              }`}
            >
              <span
                className="absolute inset-x-3 top-0 h-[2px] rounded-full opacity-80"
                style={{ background: s.hue }}
                aria-hidden
              />
              <div className="text-lg font-semibold tabular-nums">{count}</div>
              <div className="text-[11px] uppercase tracking-widest text-text-secondary">{s.label}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ─── INTEGRATION MESH ────────────────────────────────────────────────────────

const STATUS_META = {
  wired: { dot: "bg-emerald-400", label: "Wired" },
  relay: { dot: "bg-amber-400", label: "Relay" },
  dormant: { dot: "bg-slate-500", label: "Dormant" },
} as const;

function IntegrationMesh({ integrations }: { integrations: IntegrationInfo[] }) {
  if (!integrations.length) return null;
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <div className="text-xs uppercase tracking-[0.3em] text-text-tertiary">Integration Mesh</div>
        <div className="flex gap-4 text-[11px] uppercase tracking-widest text-text-tertiary">
          {(Object.keys(STATUS_META) as (keyof typeof STATUS_META)[]).map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[k].dot}`} /> {STATUS_META[k].label}
            </span>
          ))}
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {integrations.map((i) => (
          <div
            key={i.id}
            title={`${i.powers}\nWired via: ${i.wiredVia}`}
            className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 backdrop-blur-md"
          >
            <div className="flex items-center gap-2 text-sm">
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[i.status].dot} ${i.status === "wired" ? "animate-pulse" : ""}`} />
              <span style={{ color: i.hue }}>●</span>
              <span>{i.name}</span>
              <span className="text-text-tertiary text-xs">{i.category}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── CLIENT CARD ─────────────────────────────────────────────────────────────

function HealthRing({ value, hue }: { value: number; hue: string }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative h-12 w-12 shrink-0" title={`Health ${value}/100`}>
      <svg viewBox="0 0 48 48" className="h-12 w-12 -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke={hue}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * circ} ${circ}`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold tabular-nums">
        {value}
      </span>
    </div>
  );
}

function ClientCard({
  client: c,
  integrations,
  expanded,
  onToggle,
  onPatch,
  onDelete,
}: {
  client: CrmClient;
  integrations: IntegrationInfo[];
  expanded: boolean;
  onToggle: () => void;
  onPatch: (id: string, patch: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const stage = stageOf(c.stage);
  const upcoming = nextStage(c.stage);
  const [note, setNote] = useState("");
  const [linkId, setLinkId] = useState("");
  const [linkRef, setLinkRef] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const infoOf = (id: string) => integrations.find((i) => i.id === id);
  const unlinked = integrations.filter((i) => !c.integrations.some((x) => x.id === i.id));

  return (
    <article
      className={`relative rounded-2xl border bg-white/[0.02] backdrop-blur-md transition ${
        expanded ? "border-white/25" : "border-white/10 hover:border-white/20"
      }`}
    >
      <span className="absolute inset-x-5 top-0 h-[2px] rounded-full" style={{ background: stage.hue }} aria-hidden />

      <button onClick={onToggle} className="w-full text-left p-5 space-y-4">
        <div className="flex items-start gap-4">
          <HealthRing value={c.health} hue={stage.hue} />
          <div className="min-w-0 flex-1">
            <div className="font-semibold truncate">{c.company}</div>
            <div className="text-sm text-text-secondary truncate">
              {c.name}
              {c.industry ? ` · ${c.industry}` : ""}
            </div>
            <div className="mt-1 flex items-center gap-2 flex-wrap text-[11px] uppercase tracking-widest">
              <span className="rounded-full border border-white/10 px-2 py-0.5" style={{ color: stage.hue }}>
                {stage.label}
              </span>
              <span className="text-text-tertiary">{SOURCE_LABEL[c.source]}</span>
              <span className="text-text-tertiary">· {timeAgo(c.updatedAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 text-sm">
          <div className="text-text-secondary">
            <span className="text-text-tertiary text-xs uppercase tracking-widest mr-1.5">Spend</span>
            {money(c.monthlySpend)}
          </div>
          <div className="text-text-secondary">
            <span className="text-text-tertiary text-xs uppercase tracking-widest mr-1.5">Retainer</span>
            {money(c.retainer)}
          </div>
        </div>

        {c.integrations.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {c.integrations.map((i) => {
              const info = infoOf(i.id);
              return (
                <span
                  key={i.id}
                  title={info ? `${info.name}${i.externalRef ? ` · ${i.externalRef}` : ""}` : i.id}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-xs"
                  style={{ color: info?.hue }}
                >
                  {info?.name ?? i.id}
                </span>
              );
            })}
          </div>
        )}

        {c.squad.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] uppercase tracking-widest text-text-tertiary">
            {c.squad.map((id) => {
              const a = PIXEL_AGENTS.find((x) => x.id === id);
              return a ? (
                <span key={id} title={`${a.name} — ${a.role}`}>
                  <span style={{ color: a.accent }}>◆</span> {a.callsign}
                </span>
              ) : null;
            })}
          </div>
        )}
      </button>

      {expanded && (
        <div className="border-t border-white/10 p-5 space-y-5">
          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {upcoming && (
              <button
                onClick={() => onPatch(c.id, { stage: upcoming })}
                className="rounded-full px-4 py-1.5 text-sm font-medium text-white transition hover:opacity-90"
                style={{ background: GRAD }}
              >
                Advance → {stageOf(upcoming).label}
              </button>
            )}
            {c.stage !== "lost" && (
              <button
                onClick={() => onPatch(c.id, { stage: "lost" })}
                className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-text-secondary hover:text-text-primary transition"
              >
                Lost Signal
              </button>
            )}
            {confirmDelete ? (
              <button
                onClick={() => onDelete(c.id)}
                className="rounded-full border border-red-500/50 px-4 py-1.5 text-sm text-red-400 transition"
              >
                Confirm removal
              </button>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-text-tertiary hover:text-red-400 transition"
              >
                Remove
              </button>
            )}
          </div>

          {/* Link an integration */}
          {unlinked.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={linkId}
                onChange={(e) => setLinkId(e.target.value)}
                className="rounded-lg border border-white/10 bg-[#0a0c1a] px-3 py-1.5 text-sm"
              >
                <option value="">Link a pipe…</option>
                {unlinked.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({STATUS_META[i.status].label})
                  </option>
                ))}
              </select>
              <input
                value={linkRef}
                onChange={(e) => setLinkRef(e.target.value)}
                placeholder="account / shop / webhook ref (optional)"
                className="flex-1 min-w-40 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm placeholder:text-text-tertiary"
              />
              <button
                disabled={!linkId}
                onClick={async () => {
                  await onPatch(c.id, { linkIntegration: { id: linkId, externalRef: linkRef || undefined } });
                  setLinkId("");
                  setLinkRef("");
                }}
                className="rounded-lg border border-white/10 px-4 py-1.5 text-sm text-text-secondary hover:text-text-primary disabled:opacity-40 transition"
              >
                Link
              </button>
            </div>
          )}

          {/* Log a signal */}
          <div className="flex gap-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Log a signal — call notes, mission result, anything…"
              className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm placeholder:text-text-tertiary"
            />
            <button
              disabled={!note.trim()}
              onClick={async () => {
                await onPatch(c.id, { logEvent: { kind: "signal", summary: note.trim() } });
                setNote("");
              }}
              className="rounded-lg border border-white/10 px-4 py-1.5 text-sm text-text-secondary hover:text-text-primary disabled:opacity-40 transition"
            >
              Log
            </button>
          </div>

          {/* Timeline */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 [scrollbar-width:thin]">
            <div className="text-[11px] uppercase tracking-widest text-text-tertiary">Mission Timeline</div>
            {c.timeline.map((ev, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="text-text-tertiary tabular-nums shrink-0 w-16">{timeAgo(ev.at)}</span>
                <span className="text-text-tertiary uppercase text-[10px] tracking-widest shrink-0 w-20 pt-0.5">
                  {ev.kind}
                </span>
                <span className="text-text-secondary">{ev.summary}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

// ─── ACQUISITION DOCK ────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: "",
  company: "",
  email: "",
  phone: "",
  website: "",
  industry: "",
  monthlySpend: "",
  retainer: "",
  stage: "radar" as StageId,
  source: "manual" as ClientSource,
  notes: "",
};

function AcquisitionDock({
  integrations,
  onCreated,
}: {
  integrations: IntegrationInfo[];
  onCreated: (receipts: Receipt[]) => void;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [picked, setPicked] = useState<Record<string, string>>({}); // integration id → externalRef
  const [squad, setSquad] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = (k: keyof typeof EMPTY_FORM) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const toggleIntegration = (id: string) =>
    setPicked((p) => {
      const next = { ...p };
      if (id in next) delete next[id];
      else next[id] = "";
      return next;
    });

  const submit = async () => {
    if (!form.name.trim() || !form.company.trim()) {
      setError("Contact name and company are required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/pixel-pilot/crm/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          company: form.company,
          email: form.email || undefined,
          phone: form.phone || undefined,
          website: form.website || undefined,
          industry: form.industry || undefined,
          monthlySpend: form.monthlySpend ? Number(form.monthlySpend) : undefined,
          retainer: form.retainer ? Number(form.retainer) : undefined,
          stage: form.stage,
          source: form.source,
          notes: form.notes || undefined,
          integrations: Object.entries(picked).map(([id, ref]) => ({ id, externalRef: ref || undefined })),
          squad: squad.length ? squad : undefined,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Acquisition failed.");
        return;
      }
      setForm(EMPTY_FORM);
      setPicked({});
      setSquad([]);
      onCreated(data.receipts ?? []);
    } catch {
      setError("Network hiccup — try again.");
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm placeholder:text-text-tertiary focus:border-white/30 focus:outline-none transition";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-md space-y-6">
      <div
        className="pointer-events-none absolute -bottom-40 right-0 h-72 w-72 rounded-full opacity-15 blur-3xl"
        style={{ background: GRAD }}
        aria-hidden
      />
      <div className="relative">
        <div className="text-xs uppercase tracking-[0.3em] text-text-tertiary">Acquisition Dock</div>
        <h2 className="text-2xl font-semibold mt-1">Bring a client aboard</h2>
        <p className="text-sm text-text-secondary mt-1">
          Whatever their stack runs on — link it here. Wired pipes connect first-party; everything else rides the
          Zapier relay. Acquisition fires the onboarding workflow, and QuickBooks clients are minted as real
          customers automatically.
        </p>
      </div>

      <div className="relative grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <input value={form.name} onChange={setField("name")} placeholder="Contact name *" className={inputCls} />
        <input value={form.company} onChange={setField("company")} placeholder="Company *" className={inputCls} />
        <input value={form.email} onChange={setField("email")} placeholder="Email" className={inputCls} />
        <input value={form.phone} onChange={setField("phone")} placeholder="Phone" className={inputCls} />
        <input value={form.website} onChange={setField("website")} placeholder="Website" className={inputCls} />
        <input value={form.industry} onChange={setField("industry")} placeholder="Industry / niche" className={inputCls} />
        <input
          value={form.monthlySpend}
          onChange={setField("monthlySpend")}
          placeholder="Monthly ad spend (USD)"
          inputMode="numeric"
          className={inputCls}
        />
        <input
          value={form.retainer}
          onChange={setField("retainer")}
          placeholder="Monthly retainer (USD)"
          inputMode="numeric"
          className={inputCls}
        />
        <div className="grid grid-cols-2 gap-3">
          <select value={form.stage} onChange={setField("stage")} className={`${inputCls} bg-[#0a0c1a]`}>
            {PIPELINE.filter((s) => !s.terminal).map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <select value={form.source} onChange={setField("source")} className={`${inputCls} bg-[#0a0c1a]`}>
            {CLIENT_SOURCES.map((s) => (
              <option key={s} value={s}>
                {SOURCE_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Integration picker */}
      <div className="relative space-y-2">
        <div className="text-[11px] uppercase tracking-widest text-text-tertiary">Their stack — link every pipe they use</div>
        <div className="flex flex-wrap gap-2">
          {integrations.map((i) => {
            const on = i.id in picked;
            return (
              <button
                key={i.id}
                onClick={() => toggleIntegration(i.id)}
                title={i.powers}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                  on ? "border-white/40 bg-white/[0.08]" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                }`}
              >
                <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${STATUS_META[i.status].dot}`} />
                <span style={{ color: on ? i.hue : undefined }}>{i.name}</span>
              </button>
            );
          })}
        </div>
        {Object.keys(picked).length > 0 && (
          <div className="grid gap-2 md:grid-cols-2 pt-1">
            {Object.keys(picked).map((id) => {
              const info = integrations.find((i) => i.id === id);
              return (
                <input
                  key={id}
                  value={picked[id]}
                  onChange={(e) => setPicked((p) => ({ ...p, [id]: e.target.value }))}
                  placeholder={`${info?.name ?? id} — account id / shop / webhook (optional)`}
                  className={inputCls}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Squad picker */}
      <div className="relative space-y-2">
        <div className="text-[11px] uppercase tracking-widest text-text-tertiary">
          Assign the squadron (defaults to Strategy · Buying · Economics · Ops)
        </div>
        <div className="flex flex-wrap gap-2">
          {PIXEL_AGENTS.map((a) => {
            const on = squad.includes(a.id);
            return (
              <button
                key={a.id}
                onClick={() => setSquad((s) => (on ? s.filter((x) => x !== a.id) : [...s, a.id]))}
                title={`${a.name} — ${a.role}`}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                  on ? "border-white/40 bg-white/[0.08]" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                }`}
              >
                <span style={{ color: a.accent }}>◆</span> {a.callsign}
              </button>
            );
          })}
        </div>
      </div>

      <textarea
        value={form.notes}
        onChange={setField("notes")}
        placeholder="Mission notes — goals, offer, context for the squadron…"
        rows={3}
        className={`${inputCls} relative resize-y`}
      />

      <div className="relative flex items-center gap-4 flex-wrap">
        <button
          onClick={submit}
          disabled={busy}
          className="rounded-full px-7 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          style={{ background: GRAD }}
        >
          {busy ? "Acquiring…" : "Acquire Client →"}
        </button>
        {error && <span className="text-sm text-red-400">{error}</span>}
      </div>
    </section>
  );
}

// ─── RECEIPT TOAST ───────────────────────────────────────────────────────────

function ReceiptToast({ receipts, onClose }: { receipts: Receipt[]; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[70] w-96 max-w-[calc(100vw-3rem)] rounded-2xl border border-white/15 bg-[#0a0c1a]/95 p-5 backdrop-blur-xl shadow-2xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-text-tertiary">Engine receipts</div>
        <button onClick={onClose} className="text-text-tertiary hover:text-text-primary transition">
          ✕
        </button>
      </div>
      <div className="text-sm font-medium">Client acquired — the spine heard about it:</div>
      <div className="space-y-2">
        {receipts.map((r, i) => (
          <div key={i} className="flex gap-2 text-sm">
            <span className={r.ok ? "text-emerald-400" : r.configured ? "text-red-400" : "text-amber-400"}>
              {r.ok ? "●" : r.configured ? "●" : "○"}
            </span>
            <div>
              <span className="uppercase text-xs tracking-widest text-text-tertiary mr-2">{r.target}</span>
              <span className="text-text-secondary">{r.detail}</span>
            </div>
          </div>
        ))}
        {receipts.length === 0 && <div className="text-sm text-text-secondary">Saved to the roster.</div>}
      </div>
    </div>
  );
}
