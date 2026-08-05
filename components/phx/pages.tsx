"use client";

// ─── THE OTHER PAGES ─────────────────────────────────────────────────────────
// Employees · How it works · The report. Each one answers the next question a
// sceptical owner asks, in the order he asks it:
//   "who are they?" → "what do I have to do?" → "how do I know it worked?"

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LiveLine } from "@/components/phx/live-line";
import { DEX_CALLS, IVY_CALLS, RAE_CALLS } from "@/components/phx/scripts";
import { CREW, Robot, type Who } from "@/components/phx/robots";

// Reveal-on-scroll with a failsafe, so nothing can end up permanently blank.
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting || e.boundingClientRect.top < 0) setSeen(true);
        }),
      { threshold: 0.2 },
    );
    io.observe(el);
    const failsafe = window.setTimeout(() => setSeen(true), 1500);
    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);
  return { ref, seen };
}

// ─── EMPLOYEES ───────────────────────────────────────────────────────────────
const STAFF: { id: Who; calls: typeof IVY_CALLS }[] = [
  { id: "ivy", calls: IVY_CALLS },
  { id: "dex", calls: DEX_CALLS },
  { id: "rae", calls: RAE_CALLS },
];

export function EmployeesPage() {
  return (
    <>
      <section className="ag-section">
        <div className="ag-shell">
          <span className="ag-mono ag-eyebrow">The roster</span>
          <h2 className="ag-h2">Three hires. None of them call in sick.</h2>
          <p className="ag-lede ag-lede--wide">
            Hire one, or the whole front desk. Watch each of them work below —
            these are real exchanges, not mock-ups.
          </p>
        </div>
      </section>

      {STAFF.map((s, i) => {
        const bot = CREW[s.id];
        return (
        <section key={s.id} id={s.id} className="ag-section ag-section--tight">
          <div className="ag-shell">
            <div className={`ag-staff ${i % 2 ? "is-flipped" : ""}`}>
              <div className="ag-staff__copy">
                <div className="ag-portrait">
                  <Robot who={s.id} size={104} status="live" />
                  <div className="ag-portrait__meta">
                    <div className="ag-staff__name">{bot.name}</div>
                    <div className="ag-mono ag-staff__role" style={{ color: bot.tone }}>
                      {bot.role}
                    </div>
                  </div>
                </div>
                <p className="ag-staff__line" style={{ color: bot.tone }}>
                  &ldquo;{bot.line}&rdquo;
                </p>
                <p className="ag-staff__job">{bot.job}</p>
                <p className="ag-staff__quirk">{bot.quirk}</p>
                <dl className="ag-staff__facts">
                  <div>
                    <dt className="ag-mono">On shift</dt>
                    <dd>{bot.hours}</dd>
                  </div>
                  <div>
                    <dt className="ag-mono">Cost</dt>
                    <dd>{bot.cost}<span className="ag-staff__mo"> /mo</span></dd>
                  </div>
                </dl>
              </div>
              <div className="ag-staff__demo">
                <LiveLine calls={s.calls} agent={bot.name} who={s.id} />
              </div>
            </div>
          </div>
        </section>
        );
      })}

      <section className="ag-section">
        <div className="ag-shell ag-mid-cta">
          <h3 className="ag-h2">All three cost less than one part-timer.</h3>
          <Link href="/pricing" className="ag-btn ag-btn--solid">
            See the numbers
          </Link>
        </div>
      </section>
    </>
  );
}

// ─── HOW IT WORKS ────────────────────────────────────────────────────────────
const DAYS = [
  {
    day: "Day 0",
    title: "Fifteen minutes on the phone",
    body: "We work out what your unanswered calls cost, using your call volume and your average job. If the number's small, we say so.",
    you: "You: answer three questions",
  },
  {
    day: "Day 1",
    title: "We write down where you're starting",
    body: "Answer rate, how fast anyone replies today, review count. Captured before anything changes — otherwise nothing later is provable.",
    you: "You: nothing",
  },
  {
    day: "Day 2",
    title: "She learns your shop",
    body: "Your hours, your service area, your call-out fee, what counts as an emergency, and whose phone rings when one happens.",
    you: "You: one form, about ten minutes",
  },
  {
    day: "Day 4",
    title: "You call her yourself",
    body: "Ring the line and try to break it. Change your mind mid-call, mumble, ask for a price. Nothing is live until you're happy.",
    you: "You: make a few calls",
  },
  {
    day: "Day 5",
    title: "Your number forwards to her",
    body: "No new number, no porting, nothing to install. Your existing line forwards on no-answer — or every call, your choice.",
    you: "You: nothing. It's running.",
  },
];

export function HowPage() {
  const { ref, seen } = useInView<HTMLDivElement>();
  return (
    <>
      <section className="ag-section">
        <div className="ag-shell">
          <span className="ag-mono ag-eyebrow">Getting started</span>
          <h2 className="ag-h2">Five days. You do about ten minutes of it.</h2>
        </div>
      </section>

      <section className="ag-section ag-section--tight">
        <div className="ag-shell">
          <div className={`ag-timeline ${seen ? "is-in" : ""}`} ref={ref}>
            <span className="ag-timeline__spine" aria-hidden />
            {DAYS.map((d, i) => (
              <div key={d.day} className="ag-step" style={{ ["--i" as string]: String(i) }}>
                <span className="ag-step__node" aria-hidden />
                <div className="ag-step__body">
                  <span className="ag-mono ag-step__day">{d.day}</span>
                  <h3 className="ag-step__title">{d.title}</h3>
                  <p className="ag-step__text">{d.body}</p>
                  <span className="ag-mono ag-step__you">{d.you}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ag-section">
        <div className="ag-shell ag-mid-cta">
          <h3 className="ag-h2">Nothing to install. Nothing to port.</h3>
          <Link href="/book" className="ag-btn ag-btn--solid">
            Book the fifteen minutes
          </Link>
        </div>
      </section>
    </>
  );
}

// ─── THE REPORT ──────────────────────────────────────────────────────────────
const LINES = [
  { k: "Calls handled", v: 214, suffix: "" },
  { k: "Answered or texted back", v: 214, suffix: "" },
  { k: "Jobs booked", v: 39, suffix: "" },
  { k: "Emergencies escalated", v: 4, suffix: "" },
  { k: "Sales calls screened", v: 31, suffix: "" },
  { k: "Quotes revived by Rae", v: 6, suffix: "" },
];

const MISSES = [
  "9 missed-call texts got no reply — those are still lost.",
  "2 callers asked for a price we couldn't give and hung up.",
  "1 no-show we could not rebook.",
];

function Counter({ to, on }: { to: number; on: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!on) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setN(to);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / 900);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, on]);
  return <>{n.toLocaleString()}</>;
}

export function ReportPage() {
  const { ref, seen } = useInView<HTMLDivElement>();
  return (
    <>
      <section className="ag-section">
        <div className="ag-shell">
          <span className="ag-mono ag-eyebrow">Proof</span>
          <h2 className="ag-h2">One page, on the 3rd of every month.</h2>
          <p className="ag-lede ag-lede--wide">
            Including the part that went badly. A report with no bad numbers in it
            stops being read.
          </p>
        </div>
      </section>

      <section className="ag-section ag-section--tight">
        <div className="ag-shell">
          <div className={`ag-report ${seen ? "is-in" : ""}`} ref={ref}>
            <div className="ag-report__head">
              <span className="ag-mono">Desert Air &amp; Plumbing · March</span>
              <span className="ag-mono ag-report__stamp">Sent 3 Apr</span>
            </div>

            <div className="ag-report__grid">
              {LINES.map((l, i) => (
                <div key={l.k} className="ag-report__line" style={{ ["--i" as string]: String(i) }}>
                  <span className="ag-report__k">{l.k}</span>
                  <span className="ag-mono ag-report__v">
                    <Counter to={l.v} on={seen} />
                  </span>
                </div>
              ))}
            </div>

            <div className="ag-report__band">
              <div>
                <span className="ag-mono ag-report__bandlabel">Answer rate</span>
                <div className="ag-report__big">
                  <Counter to={100} on={seen} />%
                </div>
                <span className="ag-mono ag-report__was">was 74% before us</span>
              </div>
              <div>
                <span className="ag-mono ag-report__bandlabel">First reply</span>
                <div className="ag-report__big">
                  <Counter to={8} on={seen} />s
                </div>
                <span className="ag-mono ag-report__was">was 5h 20m before us</span>
              </div>
              <div>
                <span className="ag-mono ag-report__bandlabel">Opportunity recovered</span>
                <div className="ag-report__big ag-report__big--amber">
                  $<Counter to={18240} on={seen} />
                </div>
                <span className="ag-mono ag-report__was">opportunity, not banked revenue</span>
              </div>
            </div>

            <div className="ag-report__misses">
              <span className="ag-mono ag-report__misseshead">Honest misses</span>
              <ul>
                {MISSES.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          </div>

          <p className="ag-report__caveat ag-mono">
            Illustrative figures for one month of a shop this size — not a promise
            of your results. Your baseline is captured on day one so the
            comparison is yours, not ours.
          </p>
        </div>
      </section>

      <section className="ag-section">
        <div className="ag-shell ag-mid-cta">
          <h3 className="ag-h2">Every call recorded. Every outcome named.</h3>
          <Link href="/book" className="ag-btn ag-btn--solid">
            Book 15 minutes
          </Link>
        </div>
      </section>
    </>
  );
}
