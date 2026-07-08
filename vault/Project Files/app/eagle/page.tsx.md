---
tags: [pixel-pilot, source]
file: app/eagle/page.tsx
---

# `app/eagle/page.tsx`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/app/eagle/page.tsx`

````tsx
import Link from 'next/link';
import { EAGLE, EAGLE_SERVICES, EAGLE_AGENTS } from '@/eagle';
import { QuoteForm } from '@/components/eagle/quote-form';

const REVIEWS = [
  { name: 'Dana R.', text: 'Booked a quote online at 9pm, had a text back before I woke up and a crew that same week. Yard looks incredible.', stars: 5 },
  { name: 'Marcus T.', text: 'The paver patio they built is flawless, and I never once had to chase an invoice. Everything just… handled.', stars: 5 },
  { name: 'Priya N.', text: 'Weekly service is dead reliable. They even rescheduled around the rain without me asking.', stars: 5 },
];

const STEPS = [
  { n: '1', t: 'Get your quote', d: 'Tell us the job online or by phone. A ballpark hits your inbox in minutes.' },
  { n: '2', t: 'We schedule it', d: 'Pick a slot; we route the right crew and text you an arrival window.' },
  { n: '3', t: 'We do it right', d: 'Licensed, insured crews. Clean site, no surprises.' },
  { n: '4', t: 'Easy billing', d: 'One clear invoice, one tap to pay. Books stay clean.' },
];

export default function EagleHome() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(160deg, ${EAGLE.forest} 0%, #14512E 60%, #0F3D22 100%)` }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.4), transparent 45%)' }} />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div className="text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-medium backdrop-blur">
              <span>⭐️ 5.0</span><span className="opacity-80">· Licensed & insured · Same-week service</span>
            </div>
            <h1 className="mt-5 text-4xl sm:text-6xl font-bold leading-[1.02] tracking-tight">
              {EAGLE.tagline}
            </h1>
            <p className="mt-4 text-lg text-white/85 max-w-xl">{EAGLE.promise}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#quote" className="rounded-full bg-white px-6 py-3 text-sm font-semibold transition hover:opacity-90" style={{ color: EAGLE.forest }}>
                Get a free quote →
              </a>
              <a href="#services" className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition">
                See services
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-2 text-sm text-white/80">
              <span>✓ Free, fast quotes</span>
              <span>✓ Reliable crews</span>
              <span>✓ Clean, one-tap billing</span>
            </div>
          </div>
          <div className="lg:pl-4">
            <div id="quote-top" />
            <QuoteForm />
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-sm font-semibold uppercase tracking-widest" style={{ color: EAGLE.forest }}>What we do</div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold" style={{ color: EAGLE.ink }}>Full-service, all season</h2>
          <p className="mt-3 text-[#14261A]/60">From weekly mows to full landscape builds — one team for the whole yard.</p>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {EAGLE_SERVICES.map((s) => (
            <div key={s.id} className="group relative rounded-2xl border border-black/[0.07] bg-white p-6 hover:shadow-lg hover:-translate-y-0.5 transition">
              {s.popular && (
                <span className="absolute top-5 right-5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white" style={{ background: EAGLE.leaf }}>Popular</span>
              )}
              <div className="text-3xl">{s.icon}</div>
              <h3 className="mt-3 text-lg font-semibold" style={{ color: EAGLE.ink }}>{s.name}</h3>
              <p className="mt-1.5 text-sm text-[#14261A]/65 leading-relaxed">{s.blurb}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: EAGLE.forest }}>{s.from}</span>
                <a href="#quote" className="text-sm font-medium text-[#14261A]/60 group-hover:text-[#14261A]">Quote →</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-20" style={{ background: EAGLE.sky }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-sm font-semibold uppercase tracking-widest" style={{ color: EAGLE.forest }}>How it works</div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold" style={{ color: EAGLE.ink }}>Effortless from quote to paid</h2>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl bg-white p-6 border border-black/[0.05]">
                <div className="flex h-9 w-9 items-center justify-center rounded-full text-white text-sm font-bold" style={{ background: EAGLE.forest }}>{s.n}</div>
                <h3 className="mt-3 font-semibold" style={{ color: EAGLE.ink }}>{s.t}</h3>
                <p className="mt-1 text-sm text-[#14261A]/60">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORK / GALLERY */}
      <section id="work" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-sm font-semibold uppercase tracking-widest" style={{ color: EAGLE.forest }}>Our work</div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold" style={{ color: EAGLE.ink }}>Yards we&apos;re proud of</h2>
        </div>
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {['🌳', '🏡', '🌸', '🪴', '🧱', '💧', '🍂', '⛲️'].map((g, i) => (
            <div key={i} className="aspect-[4/3] rounded-xl flex items-center justify-center text-4xl" style={{ background: `linear-gradient(135deg, ${EAGLE.moss}, ${EAGLE.forest})` }}>
              <span className="opacity-90">{g}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-[#14261A]/40">Sample gallery — swap in real project photos anytime.</p>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="py-20" style={{ background: '#0F1A12' }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto text-white">
            <div className="text-sm font-semibold uppercase tracking-widest" style={{ color: EAGLE.leaf }}>Reviews</div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold">Neighbors who&apos;d recommend us</h2>
          </div>
          <div className="mt-12 grid sm:grid-cols-3 gap-5">
            {REVIEWS.map((r) => (
              <div key={r.name} className="rounded-2xl bg-white/[0.06] border border-white/10 p-6 text-white">
                <div className="text-[#D8A93B]">{'★'.repeat(r.stars)}</div>
                <p className="mt-3 text-sm text-white/85 leading-relaxed">“{r.text}”</p>
                <div className="mt-4 text-sm font-semibold">{r.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE CTA */}
      <section id="quote" className="mx-auto max-w-6xl px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: EAGLE.ink }}>Ready for a yard you don&apos;t have to think about?</h2>
          <p className="mt-3 text-[#14261A]/65">Send it over and Rowan, our AI Sales Closer, gets you a ballpark fast — then books the estimate. No pressure, no runaround.</p>
          <div className="mt-6 flex items-center gap-3 text-sm text-[#14261A]/70">
            <span className="flex h-8 items-center rounded-full px-3 font-semibold" style={{ background: EAGLE.sky, color: EAGLE.forest }}>⚡ Replies in under an hour</span>
          </div>
          <Link href="/eagle/ops" className="mt-8 inline-flex items-center gap-2 text-sm font-medium" style={{ color: EAGLE.forest }}>
            Peek behind the curtain — meet the {EAGLE_AGENTS.length} AI employees running Eagle →
          </Link>
        </div>
        <QuoteForm />
      </section>
    </div>
  );
}
````
