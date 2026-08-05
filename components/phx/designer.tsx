"use client";

// ─── BUILD YOUR EMPLOYEE ─────────────────────────────────────────────────────
// A five-step configurator where the payoff is not a summary screen — it is
// watching the thing you just built answer a call using your business name,
// your trade and the duties you picked.
//
// The whole design rests on one idea: nothing here is a preview of what we
// *would* build. Every duty maps to a flow that already exists in the engine,
// and the rehearsal call is assembled from the same script format the console
// uses everywhere else on the site. The customer is configuring a real thing.

import { useEffect, useMemo, useRef, useState } from "react";
import { Robot, type Who } from "@/components/phx/robots";
import { type Call, RING_MS, TONE } from "@/components/phx/scripts";

// ─── the options ─────────────────────────────────────────────────────────────
const CHASSIS: { id: Who; label: string; blurb: string }[] = [
  { id: "ivy", label: "Warm", blurb: "Headset and a soft visor. Sounds like your best front-desk hire." },
  { id: "dex", label: "Brisk", blurb: "Scan bar and a beacon. Straight to the point, never late." },
  { id: "rae", label: "Patient", blurb: "One steady lens. Happy to ask a fourth time." },
];

const TONES = [
  { id: "amber", hex: "#ffb44a", label: "Amber" },
  { id: "signal", hex: "#4fd1a5", label: "Signal" },
  { id: "violet", hex: "#9b8cff", label: "Violet" },
  { id: "ice", hex: "#5cc8ff", label: "Ice" },
];

type DutyId =
  | "answer" | "book" | "emergency" | "screen"
  | "missed" | "confirm" | "quotes" | "reviews";

const DUTIES: { id: DutyId; label: string; detail: string; core?: boolean }[] = [
  { id: "answer", label: "Answer every call", detail: "24/7, no voicemail", core: true },
  { id: "book", label: "Book the job", detail: "Straight onto your calendar", core: true },
  { id: "emergency", label: "Escalate emergencies", detail: "Wake a human in under a minute" },
  { id: "screen", label: "Screen sales calls", detail: "You never hear the SEO pitch" },
  { id: "missed", label: "Text back missed calls", detail: "Within 60 seconds" },
  { id: "confirm", label: "Confirm tomorrow's jobs", detail: "Before you're awake" },
  { id: "quotes", label: "Chase quiet quotes", detail: "Two follow-ups, then an honest close" },
  { id: "reviews", label: "Ask for reviews", detail: "After every completed job" },
];

const TRADES = ["HVAC", "Plumbing", "Roofing", "Electrical", "Garage doors", "Landscaping", "Something else"];

// One caller per trade: what they say out loud, and the short label the console
// files it under. Adding a trade to TRADES without a row here falls back to HVAC.
const TRADE_CALLS: Record<string, { said: string; issue: string }> = {
  HVAC: { said: "AC quit and it's 108 out", issue: "AC not cooling" },
  Plumbing: { said: "water heater's leaking all over the garage", issue: "Water heater leak" },
  Roofing: { said: "roof's leaking into the back bedroom", issue: "Roof leak" },
  Electrical: { said: "half the outlets in the kitchen are dead", issue: "Dead outlets" },
  "Garage doors": { said: "garage door won't close, it's stuck open", issue: "Door stuck open" },
  Landscaping: { said: "irrigation line burst in the front yard", issue: "Burst irrigation line" },
  "Something else": { said: "something's broken and nobody's called me back", issue: "Needs a callout" },
};

const EMERGENCIES = ["Gas smell", "Flooding / burst pipe", "No heat or AC in extreme weather", "Sparks or burning smell", "Sewage backup"];

// Duties that cost more than the base plan, used for the honest estimate.
const PLAN_FOR = (duties: DutyId[]) => {
  const has = (d: DutyId) => duties.includes(d);
  if (has("quotes") && has("confirm")) return { name: "Front Office", price: 2190, staff: 3 };
  if (has("confirm")) return { name: "Crew", price: 1590, staff: 2 };
  if (has("answer") || has("book") || has("emergency") || has("screen")) return { name: "Answer", price: 899, staff: 1 };
  return { name: "Line", price: 349.99, staff: 0 };
};

// ─── the rehearsal call, assembled from their choices ────────────────────────
function buildCall(cfg: Config): Call {
  const bot = cfg.botName || "your employee";
  const shop = cfg.business || "the shop";
  const trade = cfg.trade || "HVAC";
  // What the caller says, and the short label the console files it under. Kept
  // as two separate strings rather than truncating the first — a captured field
  // clipped mid-word ("water heater's leaking all over th") reads as a bug.
  const { said, issue } = TRADE_CALLS[trade] ?? TRADE_CALLS.HVAC;
  const problem = said;

  const wantsEmergency = cfg.duties.includes("emergency");
  const wantsBooking = cfg.duties.includes("book");

  const turns: Call["turns"] = [
    { at: 2600, who: "agent", text: `${shop}, this is ${bot} — what's going on?` },
    { at: 4600, who: "caller", text: problem },
  ];
  const slots: Call["slots"] = [{ at: 5000, k: "Issue", v: issue }];
  let outcome: Call["outcome"];
  let end = 14000;

  if (wantsEmergency && cfg.emergencies.length) {
    turns.push(
      { at: 6100, who: "agent", text: "That's on your emergency list — I'm getting someone now. Address?" },
      { at: 8200, who: "caller", text: "1420 East Osborn" },
      { at: 9500, who: "agent", text: `Connecting you to the on-call tech. ${cfg.wakeName || "The owner"} has been texted.` },
    );
    slots.push({ at: 8600, k: "Address", v: "1420 E Osborn" }, { at: 9700, k: "Alerted", v: cfg.wakeName || "Owner" });
    outcome = { at: 10500, kind: "escalated", label: "Escalated", note: `${bot} woke a human. That's the whole point of the list.` };
  } else if (wantsBooking) {
    turns.push(
      { at: 6200, who: "agent", text: "I can get someone out tomorrow morning. What's the address?" },
      { at: 8400, who: "caller", text: "1420 East Osborn" },
      { at: 9800, who: "agent", text: "Booked. Confirmation text is on its way." },
    );
    slots.push({ at: 8800, k: "Address", v: "1420 E Osborn" }, { at: 10000, k: "Window", v: "Tomorrow AM" });
    outcome = { at: 10800, kind: "booked", label: "Booked", note: `${bot} put it on the calendar without you.` };
  } else {
    turns.push(
      { at: 6200, who: "agent", text: "Let me take your details and have someone call you straight back." },
      { at: 8400, who: "caller", text: "It's Dana, 480 555 0198" },
    );
    slots.push({ at: 8800, k: "Caller", v: "Dana · (480) 555-0198" });
    outcome = { at: 9600, kind: "screened", label: "Message taken", note: `${bot} took it down. Add "book the job" and she'd have closed it.` };
    end = 12800;
  }

  return {
    from: "(480) 555-0198",
    when: cfg.hours === "24/7" ? "9:14 PM · after hours" : "9:14 PM · outside your hours",
    turns,
    slots,
    outcome,
    end,
  };
}

// ─── config ──────────────────────────────────────────────────────────────────
type Config = {
  botName: string;
  chassis: Who;
  tone: string;
  duties: DutyId[];
  trade: string;
  business: string;
  hours: string;
  emergencies: string[];
  wakeName: string;
  wakePhone: string;
  yourName: string;
  email: string;
  phone: string;
  notes: string;
};

const BLANK: Config = {
  botName: "", chassis: "ivy", tone: "#ffb44a",
  duties: ["answer", "book", "emergency", "screen"],
  trade: "", business: "", hours: "24/7", emergencies: ["Gas smell", "Flooding / burst pipe"],
  wakeName: "", wakePhone: "", yourName: "", email: "", phone: "", notes: "",
};

const STEPS = ["Name it", "Duties", "Your shop", "Rehearsal", "Send it"];

// ─── the console, running their call ─────────────────────────────────────────
function clock(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function Rehearsal({ cfg, play }: { cfg: Config; play: boolean }) {
  const call = useMemo(() => buildCall(cfg), [cfg]);
  const [elapsed, setElapsed] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!play) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setElapsed(call.end);
      return;
    }
    setElapsed(0);
    let last = performance.now();
    const loop = (now: number) => {
      setElapsed((p) => (p >= call.end ? 0 : p + (now - last)));
      last = now;
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [play, call]);

  const ringing = elapsed < RING_MS;
  const turns = call.turns.filter((t) => elapsed >= t.at);
  const slots = call.slots.filter((s) => elapsed >= s.at);
  const resolved = elapsed >= call.outcome.at;

  return (
    <div className="ag-console">
      <div className="ag-console__bar">
        <div className="ag-console__who">
          <Robot who={cfg.chassis} tone={cfg.tone} size={32} status={ringing ? "ringing" : "live"} className="ag-console__bot" />
          <span className="ag-mono ag-console__num">{call.from}</span>
          <span className="ag-console__when">{call.when}</span>
        </div>
        <span className="ag-mono ag-console__timer">{clock(Math.max(0, elapsed - RING_MS))}</span>
      </div>
      <div className="ag-console__body">
        <div className="ag-thread">
          {ringing ? (
            <div className="ag-ring">
              <span className="ag-ring__pulse" aria-hidden />
              <span className="ag-ring__pulse ag-ring__pulse--2" aria-hidden />
              <span className="ag-mono ag-ring__label">Incoming</span>
            </div>
          ) : (
            <>
              {turns.map((t, i) => (
                <div key={i} className={`ag-turn ag-turn--${t.who}`}>
                  <span className="ag-mono ag-turn__t">{clock(t.at - RING_MS)}</span>
                  <p className="ag-turn__text">{t.text}</p>
                </div>
              ))}
              {!resolved && <span className="ag-caret" aria-hidden />}
            </>
          )}
        </div>
        <div className="ag-capture">
          <div className="ag-mono ag-capture__head">Captured</div>
          {slots.length === 0 && <div className="ag-capture__empty">—</div>}
          {slots.map((s, i) => (
            <div key={i} className="ag-capture__row">
              <span className="ag-mono ag-capture__k">{s.k}</span>
              <span className="ag-capture__v">{s.v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={`ag-outcome ${resolved ? "is-in" : ""}`} style={{ borderColor: resolved ? TONE[call.outcome.kind] : "transparent" }}>
        {resolved && (
          <>
            <span className="ag-mono ag-outcome__chip" style={{ color: TONE[call.outcome.kind], borderColor: TONE[call.outcome.kind] }}>
              {call.outcome.label}
            </span>
            <span className="ag-outcome__note">{call.outcome.note}</span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── the builder ─────────────────────────────────────────────────────────────
export function Designer() {
  const [step, setStep] = useState(0);
  const [cfg, set] = useState<Config>(BLANK);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<null | { ok: boolean; delivered: boolean; error?: string }>(null);

  const up = (patch: Partial<Config>) => set((c) => ({ ...c, ...patch }));
  const toggleDuty = (d: DutyId) =>
    set((c) => ({ ...c, duties: c.duties.includes(d) ? c.duties.filter((x) => x !== d) : [...c.duties, d] }));
  const toggleEmergency = (e: string) =>
    set((c) => ({ ...c, emergencies: c.emergencies.includes(e) ? c.emergencies.filter((x) => x !== e) : [...c.emergencies, e] }));

  const plan = PLAN_FOR(cfg.duties);
  const name = cfg.botName.trim() || "your employee";

  const canAdvance =
    step === 0 ? cfg.botName.trim().length > 0
    : step === 1 ? cfg.duties.length > 0
    : step === 2 ? cfg.business.trim().length > 0 && cfg.trade.length > 0
    : true;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/phx/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...cfg, plan: plan.name, planPrice: plan.price }),
      });
      const data = await res.json();
      setSent({ ok: !!data.ok, delivered: !!data.delivered, error: data.error });
    } catch (err) {
      setSent({ ok: false, delivered: false, error: err instanceof Error ? err.message : "Network error" });
    } finally {
      setSending(false);
    }
  }

  // ── the finished screen ──
  if (sent?.ok) {
    return (
      <section className="ag-section ag-section--tight">
        <div className="ag-shell ag-done">
          <Robot who={cfg.chassis} tone={cfg.tone} size={132} status="live" />
          <span className="ag-mono ag-eyebrow">Build received</span>
          <h2 className="ag-h1 ag-done__h">
            {name} is on
            <br />
            <span style={{ color: cfg.tone }}>the build list.</span>
          </h2>
          {/* One expression rather than prose interleaved with {name}: JSX drops
              the space around an expression when the surrounding text wraps
              across source lines, which silently produced "put Sableon your
              line". A template literal cannot be broken by reformatting. */}
          <p className="ag-lede ag-lede--wide" style={{ margin: "0 auto" }}>
            {`Your spec is with us. You'll hear back within one business day with what it takes to put ${name} on your line — and the honest answer if something you picked isn't worth it yet.`}
          </p>
          <div className="ag-done__spec">
            <Spec cfg={cfg} plan={plan} />
          </div>
          {!sent.delivered && (
            <p className="ag-mono ag-done__warn">
              Saved, but the notification email did not send — the mail provider
              is not configured on this deployment. Nothing is lost; it is in the
              log and we will see it.
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="ag-section ag-section--tight">
      <div className="ag-shell">
        {/* progress rail */}
        <ol className="ag-rail" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li key={s} className={`ag-rail__i ${i === step ? "is-on" : ""} ${i < step ? "is-done" : ""}`}>
              <span className="ag-mono ag-rail__n">{String(i + 1).padStart(2, "0")}</span>
              <span className="ag-rail__l">{s}</span>
            </li>
          ))}
        </ol>

        <div className="ag-build">
          {/* ── left: the questions ── */}
          <div className="ag-build__form">
            {step === 0 && (
              <div className="ag-panel">
                <h2 className="ag-h2">Give them a name.</h2>
                <p className="ag-panel__sub">This is what callers hear in the first three seconds.</p>
                <input
                  className="ag-input ag-input--big"
                  value={cfg.botName}
                  onChange={(e) => up({ botName: e.target.value.slice(0, 24) })}
                  placeholder="Ivy"
                  aria-label="Employee name"
                  autoFocus
                />
                <div className="ag-field">
                  <span className="ag-mono ag-field__l">Manner</span>
                  <div className="ag-opts">
                    {CHASSIS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => up({ chassis: c.id })}
                        aria-pressed={cfg.chassis === c.id}
                        className={`ag-opt ${cfg.chassis === c.id ? "is-on" : ""}`}
                      >
                        <Robot who={c.id} tone={cfg.tone} size={40} />
                        <span className="ag-opt__l">{c.label}</span>
                        <span className="ag-opt__d">{c.blurb}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="ag-field">
                  <span className="ag-mono ag-field__l">Lamp colour</span>
                  <div className="ag-chips">
                    {TONES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => up({ tone: t.hex })}
                        aria-pressed={cfg.tone === t.hex}
                        className={`ag-swatch ${cfg.tone === t.hex ? "is-on" : ""}`}
                        style={{ ["--sw" as string]: t.hex }}
                      >
                        <span className="ag-swatch__dot" />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="ag-panel">
                <h2 className="ag-h2">What does {name} handle?</h2>
                <p className="ag-panel__sub">Pick everything you want off your plate. You can change it later.</p>
                <div className="ag-duties">
                  {DUTIES.map((d) => {
                    const on = cfg.duties.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => toggleDuty(d.id)}
                        aria-pressed={on}
                        className={`ag-duty ${on ? "is-on" : ""}`}
                        style={on ? { ["--sw" as string]: cfg.tone } : undefined}
                      >
                        <span className="ag-duty__tick" aria-hidden>{on ? "✓" : "+"}</span>
                        <span>
                          <span className="ag-duty__l">{d.label}</span>
                          <span className="ag-duty__d">{d.detail}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="ag-panel">
                <h2 className="ag-h2">Tell {name} about the shop.</h2>
                <p className="ag-panel__sub">Enough to answer the phone like they work there.</p>
                <div className="ag-field">
                  <span className="ag-mono ag-field__l">Business name</span>
                  <input className="ag-input" value={cfg.business} onChange={(e) => up({ business: e.target.value.slice(0, 60) })} placeholder="Desert Air & Plumbing" />
                </div>
                <div className="ag-field">
                  <span className="ag-mono ag-field__l">Trade</span>
                  <div className="ag-chips">
                    {TRADES.map((t) => (
                      <button key={t} type="button" onClick={() => up({ trade: t })} aria-pressed={cfg.trade === t} className={`ag-chip ${cfg.trade === t ? "is-on" : ""}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div className="ag-field">
                  <span className="ag-mono ag-field__l">When should they answer?</span>
                  <div className="ag-chips">
                    {["24/7", "After hours only", "Overflow when we're busy"].map((h) => (
                      <button key={h} type="button" onClick={() => up({ hours: h })} aria-pressed={cfg.hours === h} className={`ag-chip ${cfg.hours === h ? "is-on" : ""}`}>{h}</button>
                    ))}
                  </div>
                </div>
                {cfg.duties.includes("emergency") && (
                  <>
                    <div className="ag-field">
                      <span className="ag-mono ag-field__l">What counts as an emergency?</span>
                      <div className="ag-chips">
                        {EMERGENCIES.map((e) => (
                          <button key={e} type="button" onClick={() => toggleEmergency(e)} aria-pressed={cfg.emergencies.includes(e)} className={`ag-chip ${cfg.emergencies.includes(e) ? "is-on" : ""}`}>{e}</button>
                        ))}
                      </div>
                    </div>
                    <div className="ag-field ag-field--split">
                      <div>
                        <span className="ag-mono ag-field__l">Who do we wake?</span>
                        <input className="ag-input" value={cfg.wakeName} onChange={(e) => up({ wakeName: e.target.value.slice(0, 40) })} placeholder="Mike (owner)" />
                      </div>
                      <div>
                        <span className="ag-mono ag-field__l">On what number?</span>
                        <input className="ag-input" value={cfg.wakePhone} onChange={(e) => up({ wakePhone: e.target.value.slice(0, 24) })} placeholder="(602) 555-0142" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="ag-panel">
                <h2 className="ag-h2">Here&apos;s {name} taking a call.</h2>
                <p className="ag-panel__sub">
                  Built from what you picked — your shop, your trade, your duties.
                  This is the real flow, not a mock-up.
                </p>
                {/* The console belongs in the main column, not the sidebar: this
                    is the payoff step, and the sidebar puts it below the fold. */}
                <Rehearsal cfg={cfg} play />
                <Spec cfg={cfg} plan={plan} />
              </div>
            )}

            {step === 4 && (
              <form className="ag-panel" onSubmit={submit}>
                <h2 className="ag-h2">Where do we send the build?</h2>
                <p className="ag-panel__sub">One reply, within a business day. No sequence, no drip.</p>
                <div className="ag-field">
                  <span className="ag-mono ag-field__l">Your name</span>
                  <input required className="ag-input" value={cfg.yourName} onChange={(e) => up({ yourName: e.target.value.slice(0, 80) })} placeholder="Mike Alvarez" />
                </div>
                <div className="ag-field ag-field--split">
                  <div>
                    <span className="ag-mono ag-field__l">Email</span>
                    <input required type="email" className="ag-input" value={cfg.email} onChange={(e) => up({ email: e.target.value.slice(0, 120) })} placeholder="mike@desertair.com" />
                  </div>
                  <div>
                    <span className="ag-mono ag-field__l">Phone (optional)</span>
                    <input className="ag-input" value={cfg.phone} onChange={(e) => up({ phone: e.target.value.slice(0, 24) })} placeholder="(602) 555-0142" />
                  </div>
                </div>
                <div className="ag-field">
                  <span className="ag-mono ag-field__l">Anything else? (optional)</span>
                  <textarea className="ag-input ag-input--area" rows={3} value={cfg.notes} onChange={(e) => up({ notes: e.target.value.slice(0, 600) })} placeholder="Two trucks, busiest 7–9am, my wife currently answers the phone…" />
                </div>
                {sent && !sent.ok && (
                  <p className="ag-err">Couldn&apos;t send that: {sent.error || "unknown error"}. Try again, or email us directly.</p>
                )}
                <button className="ag-btn ag-btn--solid ag-btn--lg ag-submit" disabled={sending} type="submit">
                  {sending ? "Sending…" : `Send ${name}'s build`}
                </button>
              </form>
            )}

            {/* nav */}
            {step < 4 && (
              <div className="ag-nav2">
                {step > 0 && (
                  <button type="button" className="ag-btn ag-btn--ghost" onClick={() => setStep((s) => s - 1)}>
                    Back
                  </button>
                )}
                <button
                  type="button"
                  className="ag-btn ag-btn--solid"
                  disabled={!canAdvance}
                  onClick={() => setStep((s) => s + 1)}
                >
                  {step === 2 ? "Hear them work →" : step === 3 ? "Send it →" : "Next →"}
                </button>
              </div>
            )}
          </div>

          {/* ── right: the thing you're building ── */}
          <aside className="ag-build__preview">
            <div className="ag-preview">
              <div className="ag-preview__top">
                <Robot who={cfg.chassis} tone={cfg.tone} size={92} status={step >= 3 ? "live" : "idle"} />
                <div>
                  <div className="ag-preview__name">{cfg.botName.trim() || "Unnamed"}</div>
                  <div className="ag-mono ag-preview__role" style={{ color: cfg.tone }}>
                    {cfg.trade || "Your trade"} · {cfg.hours}
                  </div>
                </div>
              </div>
              <div className="ag-loadout">
                <span className="ag-mono ag-loadout__h">Loadout</span>
                {cfg.duties.length === 0 && <span className="ag-capture__empty">Nothing selected</span>}
                {DUTIES.filter((d) => cfg.duties.includes(d.id)).map((d) => (
                  <span key={d.id} className="ag-load" style={{ ["--sw" as string]: cfg.tone }}>
                    {d.label}
                  </span>
                ))}
              </div>
              <div className="ag-preview__plan">
                <span className="ag-mono ag-preview__planl">Closest plan</span>
                <div className="ag-preview__planv" style={{ color: cfg.tone }}>
                  {plan.name} · ${plan.price.toLocaleString()}<span className="ag-mono">/mo</span>
                </div>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </section>
  );
}

// ─── the spec sheet, shown on rehearsal and after sending ────────────────────
function Spec({ cfg, plan }: { cfg: Config; plan: { name: string; price: number } }) {
  const rows: [string, string][] = [
    ["Name", cfg.botName.trim() || "—"],
    ["Manner", CHASSIS.find((c) => c.id === cfg.chassis)?.label ?? "—"],
    ["Business", cfg.business || "—"],
    ["Trade", cfg.trade || "—"],
    ["Answers", cfg.hours],
    ["Duties", DUTIES.filter((d) => cfg.duties.includes(d.id)).map((d) => d.label).join(", ") || "—"],
  ];
  if (cfg.duties.includes("emergency")) {
    rows.push(["Emergencies", cfg.emergencies.join(", ") || "—"]);
    rows.push(["Wakes", [cfg.wakeName, cfg.wakePhone].filter(Boolean).join(" · ") || "—"]);
  }
  rows.push(["Closest plan", `${plan.name} · $${plan.price.toLocaleString()}/mo`]);

  return (
    <dl className="ag-spec">
      {rows.map(([k, v]) => (
        <div key={k} className="ag-spec__row">
          <dt className="ag-mono">{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}
