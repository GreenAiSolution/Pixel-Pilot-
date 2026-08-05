import type { Metadata } from "next";
import { LeadForm } from "@/components/pixel-pilot/lead-form";

export const metadata: Metadata = {
  title: "Book a 15-minute call — PHX Growth",
  description:
    "Fifteen minutes to work out what your unanswered calls are costing, using your numbers. If it isn't much, we'll tell you and you keep the math. If it is, Ivy can be on your line within a week.",
};

const GRADIENT = "linear-gradient(90deg,#00D4FF,#6C63FF,#FF2E9A)";

const ASSURANCES = [
  { k: "15 minutes", v: "no pitch deck, no slides" },
  { k: "Within a week", v: "from signed to answering calls" },
  { k: "Month to month", v: "cancel any time, no contract" },
];

export default function BookPage() {
  return (
    <div className="relative">
      <section className="px-6 pt-28 pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-[1fr_1.05fr] gap-12 lg:gap-16 items-start">
            {/* LEFT — the pitch */}
            <div className="lg:sticky lg:top-28 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-xs uppercase tracking-[0.3em] text-text-secondary">
                  A 15-minute fit call
                </span>
              </div>
              <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[0.95] tracking-tight">
                <span className="block text-text-primary">Find out what</span>
                <span className="block bg-clip-text text-transparent" style={{ backgroundImage: GRADIENT }}>
                  a ringing phone costs you.
                </span>
              </h1>
              <p className="text-lg text-text-secondary max-w-md leading-relaxed">
                Tell us your call volume and your average job. We&apos;ll do the arithmetic out
                loud, on the call, with your numbers. If the leak isn&apos;t big enough to bother
                with, we&apos;ll say so and you keep the math.
              </p>
              <div className="grid grid-cols-3 gap-4 pt-2 max-w-md">
                {ASSURANCES.map((a) => (
                  <div key={a.k}>
                    <div className="text-lg font-semibold text-text-primary tabular-nums">{a.k}</div>
                    <div className="text-[11px] text-text-tertiary leading-tight">{a.v}</div>
                  </div>
                ))}
              </div>
              <ul className="space-y-2 pt-2">
                {[
                  "Your missed-call math, written down and sent to you the same day",
                  "A recording of Ivy handling a call for a shop like yours",
                  "An honest answer about whether this is worth it for you",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-text-secondary">
                    <span className="mt-0.5 text-[#10B981]">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* RIGHT — the form */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] opacity-20 blur-3xl" style={{ background: GRADIENT }} aria-hidden />
              <div className="relative">
                <LeadForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
