"use client";

// ─── PHX GROWTH · AI EMPLOYEES ───────────────────────────────────────────────
// The whole site says one thing: we put an AI employee on your phones.
//
// Deliberately absent: advertising, media buying, ad spend, ROAS, creative
// generation. PHX Growth does not sell those. If a section here starts drifting
// back toward "we'll run your ads", it is wrong — see SERVICES.md in
// ~/phxgrowth-engine for why.

import Link from "next/link";
import { Reveal } from "@/components/pixel-pilot/sections";

const GRADIENT = "linear-gradient(90deg,#00D4FF,#6C63FF,#FF2E9A)";

// ─── HERO ────────────────────────────────────────────────────────────────────
export function EmployeeHero() {
  return (
    <section className="min-h-screen flex flex-col justify-center px-6 py-24">
      <div className="container mx-auto max-w-5xl text-center flex flex-col items-center gap-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-xs uppercase tracking-[0.3em] text-text-secondary">
            Never miss another call
          </span>
        </div>

        <h1 className="text-[clamp(2.75rem,8vw,7rem)] leading-[0.92] font-semibold tracking-tight">
          <span className="block text-text-primary">Your phone,</span>
          <span className="block bg-clip-text text-transparent" style={{ backgroundImage: GRADIENT }}>
            always answered.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-text-secondary max-w-2xl leading-relaxed">
          PHX Growth puts an AI employee on your phones. She answers every call, books
          the job, and wakes a human when it&apos;s an emergency —{" "}
          <span className="text-text-primary">24 hours a day, seven days a week.</span>
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/book"
            className="rounded-full px-7 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: "linear-gradient(90deg,#6C63FF,#FF2E9A)" }}
          >
            Put her on the phones →
          </Link>
          <Link
            href="/pricing"
            className="rounded-full border border-white/15 px-7 py-3 text-sm font-medium text-text-primary hover:bg-white/5 transition"
          >
            See what she costs
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs uppercase tracking-[0.25em] text-text-tertiary">
          <span>Answers in one ring</span>
          <span className="text-text-tertiary/40">·</span>
          <span>Books the job</span>
          <span className="text-text-tertiary/40">·</span>
          <span>Escalates emergencies</span>
          <span className="text-text-tertiary/40">·</span>
          <span>Live in a week</span>
        </div>
      </div>
    </section>
  );
}

// ─── THE COST OF A RINGING PHONE ─────────────────────────────────────────────
// The number is the pitch. These are industry ranges, not claims about any
// specific customer — the copy says so, because a made-up statistic is the
// fastest way to lose a business owner who can count.
const LEAK = [
  {
    metric: "~1 in 4",
    label: "calls ring out",
    blurb:
      "Typical for home-services trades during working hours. Your tech is under a sink; the phone isn't going to answer itself.",
    accent: "#FF2E9A",
  },
  {
    metric: "Under 60s",
    label: "before they redial",
    blurb:
      "A caller who reaches voicemail doesn't leave one. They hang up and call the next name on the list.",
    accent: "#00D4FF",
  },
  {
    metric: "$0",
    label: "is what voicemail earns",
    blurb:
      "Every missed call is a job that was already looking for you. That's the cheapest revenue there is — and it's leaking.",
    accent: "#10B981",
  },
];

export function TheLeak() {
  return (
    <section className="px-6 py-24">
      <div className="container mx-auto max-w-6xl">
        <Reveal className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="text-xs uppercase tracking-[0.3em] text-[#FF2E9A]">── The leak</div>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight">
            The job was already{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRADIENT }}>
              yours.
            </span>
          </h2>
          <p className="text-text-secondary text-lg">
            You don&apos;t have a lead problem. You have an answering problem — and it costs more
            than any marketing you could buy to replace it.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5">
          {LEAK.map((p, i) => (
            <Reveal key={p.label} className="[transition-delay:var(--d)]">
              <div
                className="group relative h-full rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-7 overflow-hidden hover:-translate-y-1 transition"
                style={{ ["--d" as string]: `${i * 80}ms` }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-px opacity-60"
                  style={{ background: `linear-gradient(90deg,transparent,${p.accent},transparent)` }}
                />
                <div className="text-3xl font-semibold" style={{ color: p.accent }}>
                  {p.metric}
                </div>
                <div className="mt-1 text-xs uppercase tracking-[0.25em] text-text-tertiary">
                  {p.label}
                </div>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed">{p.blurb}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8 text-center text-xs text-text-tertiary">
          Industry ranges for home services, not a projection of your results. On a fit call we
          work out your number using your call volume and your average ticket.
        </Reveal>
      </div>
    </section>
  );
}

// ─── MEET IVY ────────────────────────────────────────────────────────────────
const CALL = [
  { who: "ivy", text: "Thanks for calling Desert Air, this is Ivy. What can I help you with?" },
  { who: "caller", text: "My AC stopped working and it's 108 degrees" },
  { who: "ivy", text: "Happy to help with that. Who am I speaking with?" },
  { who: "caller", text: "It's Dana Ruiz" },
  { who: "ivy", text: "Thanks Dana. What's the service address?" },
  { who: "caller", text: "1420 East Osborn Road" },
  { who: "ivy", text: "I have tomorrow morning or Thursday morning. Which works best?" },
  { who: "caller", text: "Tomorrow morning" },
  {
    who: "ivy",
    text: "You're booked, Dana, tomorrow morning at 1420 East Osborn Road. You'll get a confirmation text in a minute.",
  },
];

export function MeetIvy() {
  return (
    <section id="ivy" className="px-6 py-24">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start">
          <Reveal className="lg:sticky lg:top-28 space-y-5">
            <div className="text-xs uppercase tracking-[0.3em] text-[#6C63FF]">── Meet Ivy</div>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
              She answers.
              <br />
              She books.
              <br />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRADIENT }}>
                She never calls in sick.
              </span>
            </h2>
            <p className="text-text-secondary text-lg max-w-md leading-relaxed">
              Ivy is not a phone tree and not a voicemail box. She holds a real conversation, asks
              one thing at a time, and gets off the phone with a booked job — or a human on the
              line when it matters.
            </p>
            <div className="grid grid-cols-3 gap-3 pt-2 max-w-md">
              <div>
                <div className="text-2xl font-semibold text-text-primary">168</div>
                <div className="text-[10px] uppercase tracking-widest text-text-tertiary">
                  Hours a week
                </div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-text-primary">0</div>
                <div className="text-[10px] uppercase tracking-widest text-text-tertiary">
                  Calls to voicemail
                </div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-text-primary">1</div>
                <div className="text-[10px] uppercase tracking-widest text-text-tertiary">
                  Flat monthly fee
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6 sm:p-8">
              <div className="flex items-center gap-2 pb-5 mb-5 border-b border-white/10">
                <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-xs uppercase tracking-[0.25em] text-text-tertiary">
                  Live call · 9:14pm
                </span>
              </div>
              <div className="space-y-3">
                {CALL.map((turn, i) => (
                  <div
                    key={i}
                    className={`max-w-[86%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      turn.who === "ivy"
                        ? "bg-[#6C63FF]/10 border border-[#6C63FF]/30 text-text-primary"
                        : "ml-auto bg-white/[0.06] border border-white/10 text-text-secondary"
                    }`}
                  >
                    {turn.text}
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                <span className="text-[#10B981] uppercase tracking-[0.2em]">Outcome · booked</span>
                <span className="text-text-tertiary">
                  Owner receives: &ldquo;Dana Ruiz booked — AC out, 1420 E Osborn, tomorrow
                  morning&rdquo;
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs text-text-tertiary text-center">
              A real transcript from our test suite, not a mock-up.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─── WHAT SHE DOES ───────────────────────────────────────────────────────────
const DUTIES = [
  {
    label: "Answers every call",
    blurb:
      "Day, night, weekend, or while you're on a roof. One ring, every time — no hold music, no voicemail.",
    accent: "#00D4FF",
  },
  {
    label: "Books the job",
    blurb:
      "Name, address, the problem, and a time window — then a confirmation text lands before she hangs up.",
    accent: "#10B981",
  },
  {
    label: "Knows an emergency",
    blurb:
      "Gas, flooding, sparks, no heat in a freeze — she stops asking questions and puts a human on the line.",
    accent: "#FF2E9A",
  },
  {
    label: "Screens the junk",
    blurb:
      "The daily SEO and merchant-services pitches never reach you. She ends those politely and logs them.",
    accent: "#C9A84C",
  },
  {
    label: "Texts back missed calls",
    blurb:
      "If a call ever slips past — a second line, a dropped signal — the caller gets a text in seconds.",
    accent: "#6C63FF",
  },
  {
    label: "Writes it all down",
    blurb:
      "Every call transcribed, every outcome named, one honest page at the end of the month.",
    accent: "#00D4FF",
  },
];

export function WhatSheDoes() {
  return (
    <section className="px-6 py-24">
      <div className="container mx-auto max-w-6xl">
        <Reveal className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="text-xs uppercase tracking-[0.3em] text-[#00D4FF]">── The job</div>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight">
            What she actually{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRADIENT }}>
              does.
            </span>
          </h2>
          <p className="text-text-secondary text-lg">
            Not features. A job description — the same one you&apos;d hand a new hire.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DUTIES.map((d, i) => (
            <Reveal key={d.label} className="[transition-delay:var(--d)]">
              <div
                className="group relative h-full rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-7 overflow-hidden hover:border-white/25 hover:-translate-y-1 transition"
                style={{ ["--d" as string]: `${(i % 3) * 70}ms` }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-px opacity-60"
                  style={{ background: `linear-gradient(90deg,transparent,${d.accent},transparent)` }}
                />
                <h3 className="text-xl font-semibold">{d.label}</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">{d.blurb}</p>
              </div>
            </Reveal>
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
    price: "$349.99",
    cadence: "/month",
    tagline: "Plug the leaks. No phone answering.",
    features: [
      "Missed-call text-back within 60 seconds",
      "Web-form replies within 60 seconds",
      "Review requests after every completed job",
      "Two automations live, 200 messages a month",
      "Monthly report with the honest misses",
    ],
    cta: "Start here",
    href: "/book",
    accent: "#00D4FF",
    featured: false,
  },
  {
    name: "Ivy · AI Receptionist",
    price: "$899",
    cadence: "/month",
    tagline: "One employee, one line, every call answered.",
    features: [
      "Every call answered, 24/7 — no voicemail",
      "Books jobs straight onto your calendar",
      "Emergencies escalated to a human in under a minute",
      "Sales calls screened before they reach you",
      "Every automation above, included",
      "Full transcripts and a named outcome per call",
    ],
    cta: "Put her on the phones",
    href: "/book",
    accent: "#6C63FF",
    featured: true,
  },
  {
    name: "Founding rate",
    price: "$599",
    cadence: "/month",
    tagline: "First five businesses. That price, for life.",
    features: [
      "Everything in the Ivy plan",
      "Locked at $599 for as long as you stay",
      "Direct line to the person who built it",
      "In exchange: a testimonial once it's working",
      "Five seats. When they're gone, they're gone.",
    ],
    cta: "Claim a seat",
    href: "/book",
    accent: "#10B981",
    featured: false,
  },
];

export function EmployeePricing() {
  return (
    <section id="pricing" className="px-6 py-24">
      <div className="container mx-auto max-w-6xl">
        <Reveal className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="text-xs uppercase tracking-[0.3em] text-gold">── Pricing</div>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight">
            Cheaper than the{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRADIENT }}>
              part-timer.
            </span>
          </h2>
          <p className="text-text-secondary text-lg">
            A part-time receptionist in Phoenix runs $2,400–$3,200 a month fully loaded, and works
            40 of the week&apos;s 168 hours. Flat monthly price, month to month, cancel any time.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5 items-start">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} className="[transition-delay:var(--d)]">
              <div
                className={`relative h-full rounded-2xl border backdrop-blur-md p-7 overflow-hidden transition hover:-translate-y-1 ${
                  plan.featured
                    ? "border-[#6C63FF]/50 bg-[#6C63FF]/[0.07]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/25"
                }`}
                style={{ ["--d" as string]: `${i * 80}ms` }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-px opacity-70"
                  style={{
                    background: `linear-gradient(90deg,transparent,${plan.accent},transparent)`,
                  }}
                />
                {plan.featured && (
                  <div className="absolute top-5 right-5 text-[10px] uppercase tracking-[0.2em] text-[#8B7FFF]">
                    Most hired
                  </div>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold" style={{ color: plan.accent }}>
                    {plan.price}
                  </span>
                  <span className="text-sm text-text-tertiary">{plan.cadence}</span>
                </div>
                <p className="mt-2 text-sm text-text-secondary">{plan.tagline}</p>
                <ul className="mt-6 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2.5 text-sm text-text-secondary leading-relaxed">
                      <span style={{ color: plan.accent }} aria-hidden>
                        ✓
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`mt-7 block rounded-full px-6 py-3 text-center text-sm font-semibold transition ${
                    plan.featured
                      ? "text-white hover:opacity-90"
                      : "border border-white/15 text-text-primary hover:bg-white/5"
                  }`}
                  style={
                    plan.featured
                      ? { background: "linear-gradient(90deg,#6C63FF,#FF2E9A)" }
                      : undefined
                  }
                >
                  {plan.cta}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 text-center text-sm text-text-tertiary max-w-2xl mx-auto">
          No setup fee, no contract, no percentage of anything. If she isn&apos;t booking jobs in
          the first month, stop paying — we&apos;d rather you did than write a bad review.
        </Reveal>
      </div>
    </section>
  );
}

// ─── HOW IT GOES LIVE ────────────────────────────────────────────────────────
const STEPS = [
  {
    n: "01",
    label: "A 15-minute call",
    blurb:
      "We work out what your unanswered calls are actually costing, using your numbers. If it's not much, we'll tell you and you keep the math.",
  },
  {
    n: "02",
    label: "We take a baseline",
    blurb:
      "How many calls you get, how many ring out, how fast anyone replies today. Written down before anything changes — otherwise nothing later is provable.",
  },
  {
    n: "03",
    label: "Ivy learns your shop",
    blurb:
      "Your hours, your service area, your call-out fee, what counts as an emergency, and who she wakes when one happens.",
  },
  {
    n: "04",
    label: "She goes live",
    blurb:
      "Usually within a week. You listen to every call she takes, and you can pull her off the line in a minute if you don't like it.",
  },
];

export function HowItGoesLive() {
  return (
    <section className="px-6 py-24">
      <div className="container mx-auto max-w-5xl">
        <Reveal className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="text-xs uppercase tracking-[0.3em] text-[#10B981]">── Getting started</div>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight">
            Live in{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRADIENT }}>
              a week.
            </span>
          </h2>
        </Reveal>

        <div className="space-y-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} className="[transition-delay:var(--d)]">
              <div
                className="flex gap-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6 hover:border-white/20 transition"
                style={{ ["--d" as string]: `${i * 70}ms` }}
              >
                <div className="text-2xl font-semibold text-text-tertiary tabular-nums">{s.n}</div>
                <div>
                  <h3 className="text-lg font-semibold">{s.label}</h3>
                  <p className="mt-1.5 text-sm text-text-secondary leading-relaxed">{s.blurb}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FINAL CTA ───────────────────────────────────────────────────────────────
export function EmployeeCTA() {
  return (
    <section id="command" className="px-6 py-32">
      <Reveal className="container mx-auto max-w-3xl text-center space-y-6">
        <h2 className="text-4xl md:text-7xl font-semibold tracking-tight leading-[1.02]">
          Stop losing jobs
          <br />
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRADIENT }}>
            to a ringing phone.
          </span>
        </h2>
        <p className="text-text-secondary text-lg md:text-xl">
          Your next customer is calling right now. Someone should pick up.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link
            href="/book"
            className="rounded-full px-8 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: "linear-gradient(90deg,#6C63FF,#FF2E9A)" }}
          >
            Put her on the phones →
          </Link>
          <Link
            href="/pricing"
            className="rounded-full border border-white/15 px-8 py-3.5 text-sm font-medium text-text-primary hover:bg-white/5 transition"
          >
            See pricing
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
