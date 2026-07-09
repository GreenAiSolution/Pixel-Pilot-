"use client";

// ─── PIXEL PILOT · LEAD FORM ─────────────────────────────────────────────────
// The conversion surface. A three-step "get more customers" flow that posts to
// /api/pixel-pilot/lead — which lands the lead in the CRM, pings the Slack war
// room, and auto-replies. Every CTA on the site funnels here. Fully wired: real
// validation, a real submit, and a real receipt of where the lead just routed.

import { useState } from "react";
import Link from "next/link";

const GRADIENT = "linear-gradient(90deg,#00D4FF,#6C63FF,#FF2E9A)";

const GOALS = [
  { id: "more-customers", label: "More customers", accent: "#10B981" },
  { id: "more-leads", label: "More leads", accent: "#00D4FF" },
  { id: "lower-cac", label: "Lower my CAC", accent: "#6C63FF" },
  { id: "scale-profit", label: "Scale profitably", accent: "#FF2E9A" },
  { id: "new-launch", label: "Launch a product", accent: "#C9A84C" },
];

const SPENDS = ["Under $2k/mo", "$2k–$10k/mo", "$10k–$50k/mo", "$50k–$200k/mo", "$200k+/mo"];

type Routed = { routed?: string[]; hubspot?: { id: string } | null };

export function LeadForm() {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(GOALS[0].label);
  const [spend, setSpend] = useState(SPENDS[1]);
  const [form, setForm] = useState({ name: "", email: "", company: "", website: "", details: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [receipt, setReceipt] = useState<Routed | null>(null);
  const [error, setError] = useState<string | null>(null);

  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim());
  const canSubmit = form.name.trim().length > 1 && emailOk;

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit() {
    if (!canSubmit) {
      setStep(1);
      setError("Add your name and a valid email so we can send your plan.");
      return;
    }
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/pixel-pilot/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, goal, monthlySpend: spend }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setStatus("error");
        setError(data?.error ?? "Something went wrong — please try again.");
        return;
      }
      setReceipt(data);
      setStatus("done");
      setStep(3);
    } catch {
      setStatus("error");
      setError("Network hiccup — please try again.");
    }
  }

  if (status === "done") {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-[#10B981]/25 bg-white/[0.03] backdrop-blur-md p-8 md:p-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl pp-float" style={{ background: GRADIENT }}>
          <span className="text-2xl">✈</span>
        </div>
        <h3 className="mt-6 text-3xl font-semibold tracking-tight">You&apos;re on the flight manifest.</h3>
        <p className="mt-3 text-text-secondary">
          Your growth plan is being built. A pilot reviews your account and replies with a custom
          customer-acquisition plan — usually within one business day.
        </p>
        {receipt?.routed?.length ? (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {receipt.routed.map((r) => (
              <span key={r} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] text-text-secondary">
                <span className="text-[#10B981]">✓</span> {r}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/pricing" className="rounded-full px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90" style={{ background: "linear-gradient(90deg,#6C63FF,#FF2E9A)" }}>
            Explore services &amp; plans →
          </Link>
          <Link href="/growth" className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium hover:bg-white/5 transition">
            See your projected numbers
          </Link>
        </div>
      </div>
    );
  }

  const STEPS = ["Your goal", "Your business", "Send it"];

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress */}
      <ol className="mb-6 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              onClick={() => i <= step && setStep(i)}
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition ${
                i <= step ? "text-white" : "bg-white/10 text-text-tertiary"
              }`}
              style={i <= step ? { background: "linear-gradient(135deg,#6C63FF,#FF2E9A)" } : undefined}
            >
              {i < step ? "✓" : i + 1}
            </button>
            <span className={`text-xs ${i === step ? "text-text-primary" : "text-text-tertiary"} hidden sm:inline`}>{label}</span>
            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-white/10" />}
          </li>
        ))}
      </ol>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6 md:p-8">
        {/* STEP 0 — goal */}
        {step === 0 && (
          <div>
            <h3 className="text-xl font-semibold">What should the pilot fly toward?</h3>
            <p className="mt-1 text-sm text-text-secondary">Pick the outcome that matters most right now.</p>
            <div className="mt-5 grid sm:grid-cols-2 gap-3">
              {GOALS.map((gopt) => {
                const active = goal === gopt.label;
                return (
                  <button
                    key={gopt.id}
                    type="button"
                    onClick={() => setGoal(gopt.label)}
                    className={`group relative rounded-2xl border p-4 text-left transition ${
                      active ? "border-white/30 bg-white/[0.06]" : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: gopt.accent, boxShadow: `0 0 12px ${gopt.accent}` }} />
                    <div className="mt-3 font-semibold">{gopt.label}</div>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end">
              <button type="button" onClick={() => setStep(1)} className="rounded-full px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90" style={{ background: "linear-gradient(90deg,#6C63FF,#FF2E9A)" }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* STEP 1 — business */}
        {step === 1 && (
          <div>
            <h3 className="text-xl font-semibold">Tell us where to point it.</h3>
            <p className="mt-1 text-sm text-text-secondary">Just the essentials — we build the rest.</p>
            <div className="mt-5 grid gap-4">
              <Field label="Your name" required>
                <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Alex Rivera" className={inputCls} />
              </Field>
              <Field label="Work email" required error={form.email.length > 0 && !emailOk ? "Enter a valid email" : undefined}>
                <input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="alex@brand.com" inputMode="email" className={inputCls} />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Company">
                  <input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Brand Co." className={inputCls} />
                </Field>
                <Field label="Website / store URL">
                  <input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="brand.com" className={inputCls} />
                </Field>
              </div>
              <Field label="Monthly ad spend">
                <div className="flex flex-wrap gap-2">
                  {SPENDS.map((s) => (
                    <button key={s} type="button" onClick={() => setSpend(s)} className={`rounded-full border px-3 py-1.5 text-xs transition ${spend === s ? "border-white/30 bg-white/[0.06] text-text-primary" : "border-white/10 text-text-secondary hover:border-white/20"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
            {error && <p className="mt-4 text-sm text-[#FF6B35]">{error}</p>}
            <div className="mt-6 flex justify-between">
              <button type="button" onClick={() => setStep(0)} className="rounded-full border border-white/15 px-5 py-2.5 text-sm hover:bg-white/5 transition">← Back</button>
              <button type="button" onClick={() => setStep(2)} className="rounded-full px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90" style={{ background: "linear-gradient(90deg,#6C63FF,#FF2E9A)" }}>Continue →</button>
            </div>
          </div>
        )}

        {/* STEP 2 — review + send */}
        {step === 2 && (
          <div>
            <h3 className="text-xl font-semibold">Ready for takeoff.</h3>
            <p className="mt-1 text-sm text-text-secondary">Anything else the pilot should know?</p>
            <div className="mt-5">
              <Field label="Context (optional)">
                <textarea value={form.details} onChange={(e) => set("details", e.target.value)} rows={4} placeholder="Best-selling product, current CAC, what's not working…" className={`${inputCls} resize-none`} />
              </Field>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
              <Summary k="Goal" v={goal} />
              <Summary k="Ad spend" v={spend} />
              <Summary k="Name" v={form.name || "—"} />
              <Summary k="Email" v={form.email || "—"} />
            </dl>
            {error && <p className="mt-4 text-sm text-[#FF6B35]">{error}</p>}
            <div className="mt-6 flex justify-between">
              <button type="button" onClick={() => setStep(1)} className="rounded-full border border-white/15 px-5 py-2.5 text-sm hover:bg-white/5 transition">← Back</button>
              <button type="button" onClick={submit} disabled={status === "sending"} className="rounded-full px-7 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60" style={{ background: "linear-gradient(90deg,#6C63FF,#FF2E9A)" }}>
                {status === "sending" ? "Sending…" : "Get my growth plan →"}
              </button>
            </div>
            <p className="mt-4 text-center text-[11px] text-text-tertiary">No spam. No obligation. A real pilot reviews your account.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none transition focus:border-white/30 focus:bg-black/40";

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-widest text-text-tertiary">
        {label} {required && <span className="text-[#FF2E9A]">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-[#FF6B35]">{error}</span>}
    </label>
  );
}

function Summary({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-widest text-text-tertiary">{k}</dt>
      <dd className="mt-0.5 truncate font-medium text-text-primary">{v}</dd>
    </div>
  );
}
