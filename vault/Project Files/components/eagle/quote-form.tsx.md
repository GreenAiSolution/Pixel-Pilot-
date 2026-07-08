---
tags: [pixel-pilot, source]
file: components/eagle/quote-form.tsx
---

# `components/eagle/quote-form.tsx`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/components/eagle/quote-form.tsx`

`````tsx
"use client";

// ─── EAGLE LANDSCAPING · QUOTE / LEAD FORM ───────────────────────────────────
// The live front door. Submits to POST /api/eagle/lead, which fires the Eagle
// Zapier hook → QuickBooks (new customer), Slack (hot-lead alert) and Gmail
// (auto-reply). Works with or without the hook configured (graceful).

import { useState } from "react";
import { EAGLE_SERVICES, EAGLE } from "@/eagle";

export function QuoteForm() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", service: EAGLE_SERVICES[0].id, address: "", details: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [staged, setStaged] = useState<string[] | null>(null);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !(form.phone.trim() || form.email.trim())) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/eagle/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error();
      setStaged(Array.isArray(data?.routed) ? data.routed : []);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border p-8 text-center" style={{ borderColor: `${EAGLE.forest}33`, background: EAGLE.sky }}>
        <div className="text-4xl">✅</div>
        <h3 className="mt-3 text-2xl font-semibold" style={{ color: EAGLE.ink }}>
          Request received — you&apos;ll hear from us fast.
        </h3>
        <p className="mt-2 text-[#14261A]/70">
          Rowan (our Sales agent) is already on it. Expect a text or email within the hour with your
          ballpark and estimate options.
        </p>
        {staged && staged.length > 0 && (
          <p className="mt-4 text-xs uppercase tracking-widest" style={{ color: EAGLE.forest }}>
            Routed live → {staged.join(" · ")}
          </p>
        )}
      </div>
    );
  }

  const field = "w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-[#14261A] placeholder:text-[#14261A]/40 focus:outline-none focus:border-[#1E7A46] transition";

  return (
    <form onSubmit={submit} className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-4">
      <h3 className="text-2xl font-semibold" style={{ color: EAGLE.ink }}>
        Get a free quote
      </h3>
      <p className="text-sm text-[#14261A]/60 -mt-2">Tell us about the job. Fast, no-pressure estimate.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <input className={field} placeholder="Your name*" value={form.name} onChange={(e) => set("name", e.target.value)} />
        <input className={field} placeholder="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        <input className={field} placeholder="Email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        <select className={field} value={form.service} onChange={(e) => set("service", e.target.value)}>
          {EAGLE_SERVICES.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <input className={field} placeholder="Property address" value={form.address} onChange={(e) => set("address", e.target.value)} />
      <textarea className={field} rows={3} placeholder="What do you need done?" value={form.details} onChange={(e) => set("details", e.target.value)} />
      <button
        type="submit"
        disabled={status === "sending" || !form.name.trim() || !(form.phone.trim() || form.email.trim())}
        className="w-full rounded-lg px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
        style={{ background: EAGLE.forest }}
      >
        {status === "sending" ? "Sending…" : "Request my free quote →"}
      </button>
      {status === "error" && <p className="text-sm text-red-600">Something went wrong — call us at {EAGLE.phone}.</p>}
      <p className="text-center text-xs text-[#14261A]/50">Handled instantly by Rowan, our AI Sales Closer.</p>
    </form>
  );
}

`````
