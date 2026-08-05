"use client";

// ─── PHX GROWTH AGENTIC ──────────────────────────────────────────────────────
// Five sections. The Live Line does the explaining; everything around it stays
// quiet on purpose. If a section here needs a paragraph to make sense, it is
// the wrong section.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LiveLine } from "@/components/phx/live-line";

// ─── HERO ────────────────────────────────────────────────────────────────────
export function Hero() {
  return (
    <section className="ag-hero">
      <div className="ag-shell ag-hero__grid">
        <div className="ag-hero__copy">
          <span className="ag-mono ag-eyebrow">Answered · 24/7</span>
          <h1 className="ag-h1">
            It rang.
            <br />
            <span className="ag-h1__accent">Someone answered.</span>
          </h1>
          <p className="ag-lede">
            An AI employee on your line. She books the job, screens the junk, and
            wakes you only when it&apos;s an emergency.
          </p>
          <div className="ag-actions">
            <Link href="/book" className="ag-btn ag-btn--solid">
              Hear her take a call
            </Link>
            <Link href="/pricing" className="ag-btn ag-btn--ghost">
              $599–899 / mo
            </Link>
          </div>
        </div>

        <div className="ag-hero__console">
          <LiveLine />
        </div>
      </div>
    </section>
  );
}

// ─── THE LEAK ────────────────────────────────────────────────────────────────
// Twelve dots is a week of calls. Three fall away. Then the owner sets their
// own two numbers and watches the total count up. No form, no submit.

const CALL_OPTS = [20, 50, 100];
const TICKET_OPTS = [250, 450, 900];

function useCountUp(target: number, ms = 700) {
  const [n, setN] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setN(target);
      from.current = target;
      return;
    }
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(a + (target - a) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
      else from.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return n;
}

export function TheLeak() {
  const [calls, setCalls] = useState(50);
  const [ticket, setTicket] = useState(450);

  // 1 in 4 rings out; you close about a third of the ones you do catch.
  const monthly = Math.round((calls * 0.25 * 4.33 * 0.33 * ticket) / 10) * 10;
  const shown = useCountUp(monthly);

  return (
    <section className="ag-section">
      <div className="ag-shell">
        <span className="ag-mono ag-eyebrow">The leak</span>
        <h2 className="ag-h2">
          One in four rings out.
        </h2>

        <div className="ag-dots" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className={`ag-dots__d ${[2, 6, 9].includes(i) ? "is-lost" : ""}`}
              style={{ animationDelay: `${i * 90}ms` }}
            />
          ))}
        </div>
        <p className="ag-mono ag-dots__key">
          <span className="ag-dots__legend" /> answered
          <span className="ag-dots__legend ag-dots__legend--lost" /> gone to voicemail
        </p>

        <div className="ag-calc">
          <div className="ag-calc__inputs">
            <div className="ag-calc__field">
              <span className="ag-mono ag-calc__label">Calls a week</span>
              <div className="ag-chips" role="group" aria-label="Calls a week">
                {CALL_OPTS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCalls(c)}
                    aria-pressed={calls === c}
                    className={`ag-chip ${calls === c ? "is-on" : ""}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="ag-calc__field">
              <span className="ag-mono ag-calc__label">Average job</span>
              <div className="ag-chips" role="group" aria-label="Average job">
                {TICKET_OPTS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTicket(t)}
                    aria-pressed={ticket === t}
                    className={`ag-chip ${ticket === t ? "is-on" : ""}`}
                  >
                    ${t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="ag-calc__out">
            <span className="ag-mono ag-calc__outlabel">Walking away, monthly</span>
            <div className="ag-calc__num">${shown.toLocaleString()}</div>
            <p className="ag-calc__fine">
              Assumes one in four rings out and you close a third of what you catch.
              Your real number is the first thing we work out on a call.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SHE KNOWS THE DIFFERENCE ────────────────────────────────────────────────
const OUTCOMES = [
  {
    kind: "Booked",
    tone: "var(--ag-signal)",
    heard: "“AC quit and it's 108 out”",
    did: "Took the address, offered a window, sent the confirmation.",
  },
  {
    kind: "Escalated",
    tone: "var(--ag-alarm)",
    heard: "“Water pouring out under the sink”",
    did: "Stopped asking questions. Rang your mobile in 40 seconds.",
  },
  {
    kind: "Screened",
    tone: "var(--ag-mute)",
    heard: "“Calling about SEO for your website”",
    did: "Ended it politely. Logged it. Never reached you.",
  },
];

export function Outcomes() {
  return (
    <section className="ag-section">
      <div className="ag-shell">
        <span className="ag-mono ag-eyebrow">Judgement</span>
        <h2 className="ag-h2">Three calls. Three different answers.</h2>
        <div className="ag-outcomes">
          {OUTCOMES.map((o) => (
            <article key={o.kind} className="ag-card">
              <span className="ag-mono ag-card__chip" style={{ color: o.tone, borderColor: o.tone }}>
                {o.kind}
              </span>
              <p className="ag-card__heard">{o.heard}</p>
              <p className="ag-card__did">{o.did}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PRICING ─────────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: "Automations",
    price: "349",
    cents: ".99",
    line: "Texts back. Doesn't talk.",
    points: ["Missed-call text-back", "Web leads answered in 60s", "Review requests"],
    tone: "var(--ag-mute)",
    featured: false,
  },
  {
    name: "Ivy",
    price: "899",
    cents: "",
    line: "Answers the phone.",
    points: ["Every call, 24/7", "Books straight to your calendar", "Emergencies wake a human", "Every automation, included"],
    tone: "var(--ag-amber)",
    featured: true,
  },
  {
    name: "Founding",
    price: "599",
    cents: "",
    line: "First five. That price, for life.",
    points: ["Everything in Ivy", "Locked while you stay", "You give us a testimonial"],
    tone: "var(--ag-signal)",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section className="ag-section" id="pricing">
      <div className="ag-shell">
        <span className="ag-mono ag-eyebrow">Pricing</span>
        <h2 className="ag-h2">
          A part-timer costs $2,400 and works 40 of 168 hours.
        </h2>
        <div className="ag-plans">
          {PLANS.map((p) => (
            <article key={p.name} className={`ag-plan ${p.featured ? "is-featured" : ""}`}>
              <div className="ag-mono ag-plan__name" style={{ color: p.tone }}>
                {p.name}
              </div>
              <div className="ag-plan__price">
                <span className="ag-plan__dollar">$</span>
                {p.price}
                <span className="ag-plan__cents">{p.cents}</span>
                <span className="ag-mono ag-plan__per">/mo</span>
              </div>
              <p className="ag-plan__line">{p.line}</p>
              <ul className="ag-plan__points">
                {p.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
              <Link href="/book" className={`ag-btn ${p.featured ? "ag-btn--solid" : "ag-btn--ghost"} ag-plan__cta`}>
                {p.featured ? "Put her on" : "Choose"}
              </Link>
            </article>
          ))}
        </div>
        <p className="ag-mono ag-plans__fine">
          Month to month · no setup fee · no percentage of anything
        </p>
      </div>
    </section>
  );
}

// ─── CLOSE ───────────────────────────────────────────────────────────────────
export function Close() {
  return (
    <section className="ag-close">
      <div className="ag-shell ag-close__inner">
        <h2 className="ag-h2 ag-close__h">Your next customer is dialling.</h2>
        <Link href="/book" className="ag-btn ag-btn--solid ag-btn--lg">
          Book 15 minutes
        </Link>
        <p className="ag-mono ag-close__fine">Live on your line inside a week</p>
      </div>
    </section>
  );
}
