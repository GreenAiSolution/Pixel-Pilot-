"use client";

// ─── THE LIVE LINE ───────────────────────────────────────────────────────────
// The signature element. A call console that rings, answers itself, captures
// what it hears and resolves — then does it again with a different kind of
// caller. Three calls, on a loop, no interaction required.
//
// It exists because this audience does not read. An HVAC owner checking the
// site from a truck will not get through a paragraph about "AI-powered call
// handling", but he will watch a phone get answered.
//
// Everything derives from one elapsed-milliseconds counter, so there is no
// timer soup to leak and a reset is a single assignment.

import { useEffect, useRef, useState } from "react";

type Turn = { at: number; who: "ivy" | "caller"; text: string };
type Slot = { at: number; k: string; v: string; hot?: boolean };
type Outcome = { at: number; kind: "booked" | "escalated" | "screened"; label: string; note: string };

type Call = {
  from: string;
  when: string;
  turns: Turn[];
  slots: Slot[];
  outcome: Outcome;
  end: number;
};

const RING_MS = 2400;

const CALLS: Call[] = [
  {
    from: "(480) 555-0198",
    when: "9:14 PM · after hours",
    turns: [
      { at: 2600, who: "ivy", text: "Desert Air, this is Ivy — what's going on?" },
      { at: 4600, who: "caller", text: "AC quit and it's 108 out" },
      { at: 6200, who: "ivy", text: "I can get someone there tomorrow morning. What's the address?" },
      { at: 8400, who: "caller", text: "1420 East Osborn" },
      { at: 9800, who: "ivy", text: "Booked. Confirmation text is on its way." },
    ],
    slots: [
      { at: 5000, k: "Issue", v: "AC not cooling" },
      { at: 8800, k: "Address", v: "1420 E Osborn" },
      { at: 10000, k: "Window", v: "Tomorrow AM" },
    ],
    outcome: { at: 10800, kind: "booked", label: "Booked", note: "Job on the calendar. You slept through it." },
    end: 14200,
  },
  {
    from: "(602) 555-0111",
    when: "2:41 AM · after hours",
    turns: [
      { at: 2600, who: "ivy", text: "Desert Air, this is Ivy — what's going on?" },
      { at: 4400, who: "caller", text: "There's water pouring out under the sink" },
      { at: 5900, who: "ivy", text: "That's an emergency. I'm getting someone now — address?" },
      { at: 8000, who: "caller", text: "88 West Cactus" },
      { at: 9300, who: "ivy", text: "Connecting you to the on-call tech. Stay on the line." },
    ],
    slots: [
      { at: 4800, k: "Issue", v: "Burst line — flooding", hot: true },
      { at: 8400, k: "Address", v: "88 W Cactus" },
    ],
    outcome: { at: 10200, kind: "escalated", label: "Escalated", note: "Your phone rang 40 seconds in. That one was worth waking up for." },
    end: 13600,
  },
  {
    from: "(800) 555-0000",
    when: "11:02 AM · working hours",
    turns: [
      { at: 2600, who: "ivy", text: "Desert Air, this is Ivy — what's going on?" },
      { at: 4400, who: "caller", text: "Calling about SEO services for your website" },
      { at: 6000, who: "ivy", text: "Not interested — please take this number off your list." },
    ],
    slots: [{ at: 4800, k: "Caller", v: "Sales pitch" }],
    outcome: { at: 7200, kind: "screened", label: "Screened", note: "The fourth one this week. You heard none of them." },
    end: 10400,
  },
];

const TONE: Record<Outcome["kind"], string> = {
  booked: "var(--ag-signal)",
  escalated: "var(--ag-alarm)",
  screened: "var(--ag-mute)",
};

function clock(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function LiveLine() {
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [still, setStill] = useState(false); // reduced motion: show one finished call
  const frame = useRef<number>(0);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setStill(true);
      setElapsed(CALLS[0].end);
      return;
    }
    let last = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      setElapsed((prev) => prev + dt);
      raf = requestAnimationFrame(loop);
      frame.current = raf;
    };
    raf = requestAnimationFrame(loop);
    frame.current = raf;
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (still) return;
    if (elapsed >= CALLS[index].end) {
      setIndex((i) => (i + 1) % CALLS.length);
      setElapsed(0);
    }
  }, [elapsed, index, still]);

  const call = CALLS[index];
  const ringing = elapsed < RING_MS;
  const turns = call.turns.filter((t) => elapsed >= t.at);
  const slots = call.slots.filter((s) => elapsed >= s.at);
  const resolved = elapsed >= call.outcome.at;
  const onCall = Math.max(0, elapsed - RING_MS);

  return (
    <div className="ag-console" aria-label="Example call, played on a loop">
      {/* ── header: who's calling, and how long we've been on ── */}
      <div className="ag-console__bar">
        <div className="ag-console__who">
          <span
            className={`ag-dot ${ringing ? "is-ringing" : "is-live"}`}
            style={{ background: ringing ? "var(--ag-amber)" : "var(--ag-signal)" }}
            aria-hidden
          />
          <span className="ag-mono ag-console__num">{call.from}</span>
          <span className="ag-console__when">{call.when}</span>
        </div>
        <span className="ag-mono ag-console__timer">{clock(onCall)}</span>
      </div>

      <div className="ag-console__body">
        {/* ── the conversation ── */}
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
                <div key={`${index}-${i}`} className={`ag-turn ag-turn--${t.who}`}>
                  <span className="ag-mono ag-turn__t">{clock(t.at - RING_MS)}</span>
                  <p className="ag-turn__text">{t.text}</p>
                </div>
              ))}
              {!resolved && <span className="ag-caret" aria-hidden />}
            </>
          )}
        </div>

        {/* ── what she wrote down ── */}
        <div className="ag-capture">
          <div className="ag-mono ag-capture__head">Captured</div>
          {slots.length === 0 && <div className="ag-capture__empty">—</div>}
          {slots.map((s, i) => (
            <div key={`${index}-${i}`} className="ag-capture__row">
              <span className="ag-mono ag-capture__k">{s.k}</span>
              <span className="ag-capture__v" style={s.hot ? { color: "var(--ag-alarm)" } : undefined}>
                {s.v}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── how it ended ── */}
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

      {/* ── which of the three you're watching ── */}
      <div className="ag-console__ticks" aria-hidden>
        {CALLS.map((_, i) => (
          <span key={i} className={`ag-tick ${i === index ? "is-on" : ""}`} />
        ))}
      </div>
    </div>
  );
}
