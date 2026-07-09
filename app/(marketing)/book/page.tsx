import type { Metadata } from "next";
import { LeadForm } from "@/components/pixel-pilot/lead-form";

export const metadata: Metadata = {
  title: "Get More Customers — Pixel Pilot",
  description:
    "Book a flight with Pixel Pilot. Tell us your goal and we build a custom customer-acquisition plan — the autonomous media buyer that turns ad spend into new customers and leads.",
};

const GRADIENT = "linear-gradient(90deg,#00D4FF,#6C63FF,#FF2E9A)";

const ASSURANCES = [
  { k: "1 business day", v: "to your custom plan" },
  { k: "< 60 min", v: "from URL to live ads" },
  { k: "Profit-based", v: "reporting, not vanity metrics" },
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
                <span className="text-xs uppercase tracking-[0.3em] text-text-secondary">More customers, on autopilot</span>
              </div>
              <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[0.95] tracking-tight">
                <span className="block text-text-primary">Turn ad spend into</span>
                <span className="block bg-clip-text text-transparent" style={{ backgroundImage: GRADIENT }}>
                  new customers.
                </span>
              </h1>
              <p className="text-lg text-text-secondary max-w-md leading-relaxed">
                Tell the pilot your goal. We reverse-engineer the campaigns, creative and funnel
                that bring you buyers — then fly them 24/7. This is where your growth plan starts.
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
                  "A custom customer-acquisition plan for your account",
                  "Creative concepts forged for your niche",
                  "Honest, profit-based projections — no hype",
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
