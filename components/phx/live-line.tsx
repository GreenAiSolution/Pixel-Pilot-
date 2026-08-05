"use client";

// ─── THE LIVE LINE ───────────────────────────────────────────────────────────
// The signature element, reused across the site with a different cast each
// time: Ivy on the phones, Dex on dispatch, Rae working old quotes.
//
// It exists because this audience does not read. An HVAC owner checking the
// site from a truck will not get through a paragraph about "AI-powered call
// handling", but he will watch a phone get answered.
//
// Everything derives from one elapsed-milliseconds counter, so there is no
// timer soup to leak and a reset is a single assignment.

import { useEffect, useRef, useState } from "react";
import { type Call, IVY_CALLS, RING_MS, TONE } from "@/components/phx/scripts";
import { Robot, type Who } from "@/components/phx/robots";

function clock(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function LiveLine({
  calls = IVY_CALLS,
  agent = "Ivy",
  who = "ivy",
  compact = false,
}: {
  calls?: Call[];
  agent?: string;
  who?: Who;
  compact?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [still, setStill] = useState(false); // reduced motion: one finished call
  const raf = useRef(0);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setStill(true);
      setElapsed(calls[0].end);
      return;
    }
    let last = performance.now();
    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      setElapsed((p) => p + dt);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [calls]);

  useEffect(() => {
    if (still) return;
    if (elapsed >= calls[index].end) {
      setIndex((i) => (i + 1) % calls.length);
      setElapsed(0);
    }
  }, [elapsed, index, still, calls]);

  const call = calls[Math.min(index, calls.length - 1)];
  const ringing = elapsed < RING_MS;
  const turns = call.turns.filter((t) => elapsed >= t.at);
  const slots = call.slots.filter((s) => elapsed >= s.at);
  const resolved = elapsed >= call.outcome.at;
  const onCall = Math.max(0, elapsed - RING_MS);

  return (
    <div
      className={`ag-console ${compact ? "is-compact" : ""}`}
      aria-label={`Example ${agent} call, played on a loop`}
    >
      <div className="ag-console__bar">
        <div className="ag-console__who">
          <Robot who={who} size={32} status={ringing ? "ringing" : "live"} className="ag-console__bot" />
          <span className="ag-mono ag-console__num">{call.from}</span>
          <span className="ag-console__when">{call.when}</span>
        </div>
        <span className="ag-mono ag-console__timer">{clock(onCall)}</span>
      </div>

      <div className="ag-console__body">
        <div className="ag-thread">
          {ringing ? (
            <div className="ag-ring">
              <span className="ag-ring__pulse" aria-hidden />
              <span className="ag-ring__pulse ag-ring__pulse--2" aria-hidden />
              <span className="ag-mono ag-ring__label">Connecting</span>
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

      <div
        className={`ag-outcome ${resolved ? "is-in" : ""}`}
        style={{ borderColor: resolved ? TONE[call.outcome.kind] : "transparent" }}
      >
        {resolved && (
          <>
            <span
              className="ag-mono ag-outcome__chip"
              style={{ color: TONE[call.outcome.kind], borderColor: TONE[call.outcome.kind] }}
            >
              {call.outcome.label}
            </span>
            <span className="ag-outcome__note">{call.outcome.note}</span>
          </>
        )}
      </div>

      {calls.length > 1 && (
        <div className="ag-console__ticks" aria-hidden>
          {calls.map((_, i) => (
            <span key={i} className={`ag-tick ${i === index ? "is-on" : ""}`} />
          ))}
        </div>
      )}
    </div>
  );
}
