"use client";

// ─── PRICING ─────────────────────────────────────────────────────────────────
// The ladder is built so the top tier is the rational choice, using arithmetic
// the buyer can check rather than pressure they can feel:
//
//   1. The anchor is real. One part-time receptionist in Phoenix costs
//      $2,400–3,200/mo fully loaded and works 40 of the week's 168 hours.
//      Front Office is three roles, all 168 hours, for less than that one hire.
//
//   2. Cost per employee falls as you climb: $899 → $795 → $730. Printed on
//      every card, because a reason you can verify beats a badge that says
//      "most popular".
//
//   3. The last step is the cheapest. Answer → Crew costs $691 for a second
//      employee; Crew → Front Office costs $600 for a third. Marginal price
//      goes down exactly where we want the decision to land.
//
// What this deliberately does not do: invent a struck-through "was" price,
// fake a countdown, or claim a popularity we can't evidence. The founding rate
// below is a real, finite offer — five businesses — and it is presented as a
// discount on any plan rather than as a cheaper tier, because a cheap tier that
// undercuts the flagship makes the whole ladder incoherent.

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Plan = {
  id: string;
  name: string;
  price: number;
  suffix?: string;
  staff: number;
  per?: string;
  line: string;
  replaces: string;
  points: string[];
  tone: string;
  featured?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "line",
    name: "Line",
    price: 349,
    suffix: ".99",
    staff: 0,
    line: "Texts back. Doesn't talk.",
    replaces: "Replaces: nothing — it plugs the gaps you already have",
    points: ["Missed-call text-back", "Web leads answered in 60s", "Review requests after every job"],
    tone: "var(--ag-mute)",
  },
  {
    id: "answer",
    name: "Answer",
    price: 899,
    staff: 1,
    per: "$899",
    line: "Ivy picks up. Every time.",
    replaces: "Replaces: the calls going to voicemail",
    points: ["Every call answered, 24/7", "Books onto your calendar", "Emergencies wake a human", "Everything in Line"],
    tone: "var(--ag-paper)",
  },
  {
    id: "crew",
    name: "Crew",
    price: 1590,
    staff: 2,
    per: "$795",
    line: "Ivy answers. Dex runs the day.",
    replaces: "Replaces: the hour you spend confirming tomorrow",
    points: [
      "Ivy + Dex",
      "Morning confirmations, reschedules, on-the-way texts",
      "Two lines or two locations",
      "Everything in Answer",
    ],
    tone: "var(--ag-signal)",
  },
  {
    id: "front-office",
    name: "Front Office",
    price: 2190,
    staff: 3,
    per: "$730",
    line: "All three. The whole front desk.",
    replaces: "Replaces: one part-time receptionist — and costs less",
    points: [
      "Ivy + Dex + Rae",
      "Rae works every open quote and dormant customer",
      "Unlimited lines",
      "Named operator, monthly review call",
      "Everything in Crew",
    ],
    tone: "var(--ag-amber)",
    featured: true,
  },
];

function useCountUp(target: number, ms = 650) {
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
      const e = 1 - Math.pow(1 - p, 3);
      setN(Math.round(a + (target - a) * e));
      if (p < 1) raf = requestAnimationFrame(step);
      else from.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return n;
}

// ─── the anchor: what one human costs ────────────────────────────────────────
export function HumanAnchor() {
  return (
    <div className="ag-anchor">
      <div className="ag-anchor__row">
        <div className="ag-anchor__side">
          <span className="ag-mono ag-anchor__label">One part-time receptionist</span>
          <div className="ag-anchor__num ag-anchor__num--grey">$2,400</div>
          <span className="ag-mono ag-anchor__sub">40 of 168 hours · takes holidays · quits</span>
          <div className="ag-anchor__bar" aria-hidden>
            <span className="ag-anchor__fill ag-anchor__fill--grey" style={{ width: "24%" }} />
          </div>
          <span className="ag-mono ag-anchor__cover">24% of the week covered</span>
        </div>
        <div className="ag-anchor__vs ag-mono" aria-hidden>vs</div>
        <div className="ag-anchor__side">
          <span className="ag-mono ag-anchor__label">Front Office · three of them</span>
          <div className="ag-anchor__num">$2,190</div>
          <span className="ag-mono ag-anchor__sub">168 of 168 hours · no payroll tax · no turnover</span>
          <div className="ag-anchor__bar" aria-hidden>
            <span className="ag-anchor__fill" style={{ width: "100%" }} />
          </div>
          <span className="ag-mono ag-anchor__cover ag-anchor__cover--on">100% of the week covered</span>
        </div>
      </div>
    </div>
  );
}

// ─── the ladder ──────────────────────────────────────────────────────────────
export function Plans() {
  return (
    <>
      <div className="ag-plans">
        {PLANS.map((p) => (
          <article key={p.id} className={`ag-plan ${p.featured ? "is-featured" : ""}`}>
            {p.featured && <span className="ag-mono ag-plan__flag">Best value per employee</span>}
            <div className="ag-mono ag-plan__name" style={{ color: p.tone }}>
              {p.name}
            </div>
            <div className="ag-plan__price">
              <span className="ag-plan__dollar">$</span>
              {p.price.toLocaleString()}
              <span className="ag-plan__cents">{p.suffix ?? ""}</span>
              <span className="ag-mono ag-plan__per">/mo</span>
            </div>
            <div className="ag-mono ag-plan__each">
              {p.per ? `${p.per} per employee` : "No employee — automations only"}
            </div>
            <p className="ag-plan__line">{p.line}</p>
            <ul className="ag-plan__points">
              {p.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
            <p className="ag-mono ag-plan__replaces">{p.replaces}</p>
            <Link
              href="/book"
              className={`ag-btn ${p.featured ? "ag-btn--solid" : "ag-btn--ghost"} ag-plan__cta`}
            >
              {p.featured ? "Hire all three" : "Choose"}
            </Link>
          </article>
        ))}
      </div>
      <p className="ag-mono ag-plans__fine">
        Month to month · no setup fee · no contract · no percentage of anything
      </p>
    </>
  );
}

// ─── the arithmetic, shown ───────────────────────────────────────────────────
export function PerEmployee() {
  const bars = [
    { name: "Answer", per: 899, staff: 1 },
    { name: "Crew", per: 795, staff: 2 },
    { name: "Front Office", per: 730, staff: 3 },
  ];
  const max = 899;
  return (
    <div className="ag-peremp">
      <span className="ag-mono ag-eyebrow">The arithmetic</span>
      <h2 className="ag-h2">Each one costs less than the last.</h2>
      <div className="ag-peremp__rows">
        {bars.map((b, i) => (
          <div key={b.name} className="ag-peremp__row">
            <span className="ag-mono ag-peremp__name">{b.name}</span>
            <div className="ag-peremp__track">
              <span
                className="ag-peremp__fill"
                style={{
                  width: `${(b.per / max) * 100}%`,
                  background: i === bars.length - 1 ? "var(--ag-amber)" : "rgba(255,180,74,0.28)",
                  animationDelay: `${i * 140}ms`,
                }}
              />
            </div>
            <span className="ag-mono ag-peremp__val" style={i === bars.length - 1 ? { color: "var(--ag-amber)" } : undefined}>
              ${b.per}
            </span>
          </div>
        ))}
      </div>
      <p className="ag-peremp__note">
        Adding the second employee costs $691. Adding the third costs $600. The
        more of the front desk you hand over, the less each one costs you.
      </p>
    </div>
  );
}

// ─── founding offer — a discount on any plan, not a cheaper tier ─────────────
export function Founding() {
  return (
    <aside className="ag-founding">
      <div className="ag-founding__inner">
        <span className="ag-mono ag-founding__flag">Founding rate · 5 businesses</span>
        <p className="ag-founding__text">
          <strong>One third off any plan, locked for as long as you stay.</strong> In
          exchange we ask for a testimonial once it&apos;s working, and one reference
          call. Five seats, then it closes.
        </p>
        <Link href="/book" className="ag-btn ag-btn--ghost">
          Ask about a seat
        </Link>
      </div>
    </aside>
  );
}

// ─── the whole page ──────────────────────────────────────────────────────────
export function PricingPage() {
  return (
    <>
      <section className="ag-section">
        <div className="ag-shell">
          <span className="ag-mono ag-eyebrow">Pricing</span>
          <h2 className="ag-h2">Three employees cost less than one.</h2>
          <HumanAnchor />
        </div>
      </section>

      <section className="ag-section ag-section--tight">
        <div className="ag-shell">
          <Plans />
        </div>
      </section>

      <section className="ag-section">
        <div className="ag-shell">
          <PerEmployee />
        </div>
      </section>

      <section className="ag-section ag-section--tight">
        <div className="ag-shell">
          <Founding />
        </div>
      </section>
    </>
  );
}
