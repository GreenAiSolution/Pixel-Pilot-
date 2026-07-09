"use client";

// ─── PIXEL PILOT · MARKETING SECTIONS ────────────────────────────────────────
// Every marketing section as a self-contained, reusable component. The homepage
// composes a lean subset; each menu item renders its own section on a dedicated
// page (app/(marketing)/<name>/page.tsx). Single source of truth for the surface.

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  SERVICES,
  CREATIVE_APPS,
  WORKFLOWS,
  PIXEL_AGENTS,
  TIERS,
  SERVICE_PRICING,
  OUTCOMES,
  MONEY_MECHANISM,
  RESULT_STORIES,
  TESTIMONIALS,
  PROOF_POINTS,
  GUARANTEE,
  SHOWCASE,
  VIBES,
  PIXEL_PILOT_REEL,
} from "@/pixel-pilot";
import { CreativeForge } from "@/components/pixel-pilot/creative-forge";

const GRADIENT = "linear-gradient(90deg,#00D4FF,#6C63FF,#FF2E9A)";

// ─── SCROLL-REVEAL WRAPPER ────────────────────────────────────────────────────
export function Reveal({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} id={id} className={`transition-all duration-700 ease-out ${className}`} style={{ opacity: 0, transform: "translateY(28px)" }}>
      {children}
    </div>
  );
}

// A thin band that gives standalone pages breathing room under the sticky nav.
function PageTop({ children }: { children: React.ReactNode }) {
  return <div className="pt-20">{children}</div>;
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
export function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center px-6 py-24">
      <div className="container mx-auto max-w-5xl text-center flex flex-col items-center gap-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF2E9A] animate-pulse" />
          <span className="text-xs uppercase tracking-[0.3em] text-text-secondary">The new face of paid media</span>
        </div>
        <h1 className="text-[clamp(2.75rem,8vw,7rem)] leading-[0.92] font-semibold tracking-tight">
          <span className="block bg-clip-text text-transparent" style={{ backgroundImage: GRADIENT }}>
            Your ad spend,
          </span>
          <span className="block text-text-primary">on autopilot.</span>
        </h1>
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl leading-relaxed">
          Pixel Pilot isn&apos;t a dashboard. It&apos;s an autonomous media buyer that flies Meta, Google &amp; TikTok to{" "}
          <span className="text-text-primary">real profit</span> — 24/7, hands off the wheel.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link href="/book" className="rounded-full px-7 py-3 text-sm font-semibold text-white transition hover:opacity-90" style={{ background: "linear-gradient(90deg,#6C63FF,#FF2E9A)" }}>
            Get more customers →
          </Link>
          <Link href="/growth" className="rounded-full border border-white/15 px-7 py-3 text-sm font-medium text-text-primary hover:bg-white/5 transition">
            Calculate my growth
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs uppercase tracking-[0.25em] text-text-tertiary">
          <span>Profit-optimized</span>
          <span className="text-text-tertiary/40">·</span>
          <span>4 native channels</span>
          <span className="text-text-tertiary/40">·</span>
          <span>Higgsfield creative</span>
          <span className="text-text-tertiary/40">·</span>
          <span>&lt;60min to live</span>
        </div>
      </div>
    </section>
  );
}

// ─── HOME DIRECTORY — links out to every page ─────────────────────────────────
const DIRECTORY: { href: string; label: string; blurb: string; accent: string }[] = [
  { href: "/book", label: "Get More Customers", blurb: "Start your growth plan — the fastest runway to new buyers.", accent: "#10B981" },
  { href: "/growth", label: "Growth Calculator", blurb: "See the new customers & leads your spend can buy.", accent: "#00D4FF" },
  { href: "/results", label: "Results", blurb: "More customers, more profit — how, and the proof.", accent: "#10B981" },
  { href: "/pricing", label: "Services & Pricing", blurb: "The five services and every plan, priced.", accent: "#C9A84C" },
  { href: "/agents", label: "Agents", blurb: "The crew of specialist operators.", accent: "#6C63FF" },
  { href: "/forge", label: "Creative Forge", blurb: "Watch it make the ad, live.", accent: "#FF2E9A" },
  { href: "/automation", label: "Automation", blurb: "The n8n loops + zero-to-live flight plan.", accent: "#00D4FF" },
  { href: "/stack", label: "The Stack", blurb: "The full business brain of apps & tools.", accent: "#6C63FF" },
  { href: "/film", label: "Brand Film", blurb: "Watch the pilot fly.", accent: "#C9A84C" },
];

export function HomeDirectory() {
  return (
    <section className="px-6 py-24">
      <div className="container mx-auto max-w-6xl">
        <Reveal className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="text-xs uppercase tracking-[0.3em] text-[#00D4FF]">── The Platform</div>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight">
            Explore the{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRADIENT }}>
              full platform
            </span>
            .
          </h2>
          <p className="text-text-secondary text-lg">Everything Pixel Pilot flies, organized. Pick a runway.</p>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DIRECTORY.map((d, i) => (
            <Reveal key={d.href} className="[transition-delay:var(--d)]">
              <Link
                href={d.href}
                className="group relative block h-full rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-7 overflow-hidden hover:border-white/25 hover:-translate-y-1 transition"
                style={{ ["--d" as string]: `${(i % 3) * 70}ms` }}
              >
                <div className="absolute inset-x-0 top-0 h-px opacity-60" style={{ background: `linear-gradient(90deg,transparent,${d.accent},transparent)` }} />
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{d.label}</h3>
                  <span className="text-lg transition group-hover:translate-x-1" style={{ color: d.accent }}>
                    →
                  </span>
                </div>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">{d.blurb}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── BRAND FILM ───────────────────────────────────────────────────────────────
export function BrandFilm() {
  return (
    <PageTop>
      <section id="film" className="px-6 py-24">
        <div className="container mx-auto max-w-5xl">
          <Reveal className="text-center max-w-2xl mx-auto space-y-4 mb-10">
            <div className="text-xs uppercase tracking-[0.3em] text-[#00D4FF]">── The Brand Film</div>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Watch the pilot fly.</h2>
            <p className="text-text-secondary text-lg">One pass from Pixel Pilot turns a struggling shop into a landmark — and the customers come running.</p>
          </Reveal>
          <Reveal>
            <div className="relative mx-auto">
              <div className="absolute -inset-2 rounded-[1.75rem] opacity-30 blur-2xl" style={{ background: GRADIENT }} aria-hidden />
              <video className="relative w-full aspect-video rounded-2xl border border-white/10 object-cover" src="/brand-film.mp4" poster="/brand-film-poster.jpg" autoPlay loop muted playsInline preload="metadata" />
            </div>
          </Reveal>
        </div>
      </section>
    </PageTop>
  );
}

// ─── AGENT CREW ───────────────────────────────────────────────────────────────
export function AgentCrew() {
  return (
    <PageTop>
      <section id="agents" className="px-6 py-24">
        <div className="container mx-auto max-w-6xl">
          <Reveal className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 items-start">
            <div className="lg:sticky lg:top-28 space-y-4">
              <div className="text-xs uppercase tracking-[0.3em] text-[#00D4FF]">── Agent Crew</div>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
                {PIXEL_AGENTS.length} operators.
                <br />
                One autopilot.
              </h2>
              <p className="text-text-secondary text-lg max-w-md">
                Pixel Pilot is not one giant prompt. It is a crew of specialized agents that plan, buy, forge creative, check profit, close sales, rank you #1, win five-star reviews, guard policy and run the flight deck — 24/7.
              </p>
              <div className="grid grid-cols-3 gap-3 pt-3 max-w-md">
                <div>
                  <div className="text-2xl font-semibold text-text-primary">{PIXEL_AGENTS.length}</div>
                  <div className="text-[10px] uppercase tracking-widest text-text-tertiary">Agents</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-text-primary">{WORKFLOWS.length}</div>
                  <div className="text-[10px] uppercase tracking-widest text-text-tertiary">Workflows</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-text-primary">24/7</div>
                  <div className="text-[10px] uppercase tracking-widest text-text-tertiary">Cadence</div>
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {PIXEL_AGENTS.map((agent) => (
                <div key={agent.id} className="group relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-5 overflow-hidden hover:border-white/20 transition">
                  <div className="absolute inset-x-0 top-0 h-px opacity-70" style={{ background: `linear-gradient(90deg,transparent,${agent.accent},transparent)` }} />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.25em] text-text-tertiary">{agent.domain}</div>
                      <h3 className="mt-2 text-xl font-semibold leading-tight">{agent.name}</h3>
                      <div className="mt-1 text-sm" style={{ color: agent.accent }}>
                        {agent.role}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md border border-white/10 px-2 py-1 text-[10px] uppercase tracking-widest" style={{ color: agent.accent }}>
                      {agent.callsign}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-text-primary">{agent.tagline}</p>
                  <p className="mt-2 text-[13px] text-text-secondary leading-relaxed">{agent.intelligence}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {agent.kpis.map((kpi) => (
                      <span key={`${agent.id}-${kpi.label}`} className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] text-text-secondary">
                        <span style={{ color: agent.accent }}>{kpi.value}</span> {kpi.label}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-white/10 pt-3 text-[11px] text-text-tertiary">
                    Invoke <code className="text-text-secondary">@{agent.command}</code>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </PageTop>
  );
}

// ─── CREATIVE FORGE ───────────────────────────────────────────────────────────
export function Forge() {
  return (
    <PageTop>
      <section id="forge" className="px-6 py-24">
        <div className="container mx-auto max-w-6xl">
          <Reveal className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <div className="text-xs uppercase tracking-[0.3em] text-[#FF2E9A]">── Creative Forge · powered by Higgsfield</div>
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight">Watch it make the ad.</h2>
            <p className="text-text-secondary text-lg">
              This is the product automating itself, live. Drop a brand, pick a vibe, and Pixel Pilot fires Higgsfield to forge a scroll-stopping reel — the same engine that refreshes fatigued creative on your account automatically.
            </p>
          </Reveal>
          <Reveal className="mb-12">
            <div className="relative mx-auto max-w-4xl aspect-video overflow-hidden rounded-2xl border border-white/10">
              <video src={PIXEL_PILOT_REEL} autoPlay loop muted playsInline className="h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05060f] via-transparent to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 text-center">
                <div className="text-2xl font-semibold tracking-[0.18em] uppercase bg-clip-text text-transparent inline-block" style={{ backgroundImage: GRADIENT }}>
                  Pixel<span className="text-white">/Pilot</span>
                </div>
                <div className="mt-1 text-xs uppercase tracking-[0.3em] text-text-tertiary">Your ad spend, on autopilot · brand film forged with Higgsfield</div>
              </div>
            </div>
          </Reveal>
          <Reveal>
            <CreativeForge />
          </Reveal>
          <Reveal className="mt-16">
            <div className="text-xs uppercase tracking-[0.3em] text-text-tertiary text-center mb-6">── Forged with Higgsfield · real output</div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {VIBES.map((v) => {
                const shot = SHOWCASE[v.id];
                return (
                  <figure key={v.id} className="group relative rounded-2xl border border-white/10 bg-black/40 overflow-hidden aspect-[9/16]">
                    {shot.videoUrl ? (
                      <video src={shot.videoUrl} poster={shot.posterUrl} autoPlay loop muted playsInline className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={shot.posterUrl} alt={`${v.name} ad forged with Higgsfield`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
                    )}
                    <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-white">{v.name}</span>
                        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[9px] uppercase tracking-widest text-white/90 backdrop-blur">{shot.videoUrl ? "Reel" : "Still"}</span>
                      </div>
                      <div className="mt-0.5 text-[10px] text-white/70">{shot.caption}</div>
                      <div className="mt-0.5 text-[9px] uppercase tracking-widest text-white/50">{shot.model}</div>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </Reveal>
          <Reveal className="mt-16">
            <div className="text-xs uppercase tracking-[0.3em] text-text-tertiary text-center mb-6">── The apps you actually open</div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CREATIVE_APPS.map((a) => (
                <div key={a.id} className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-5 hover:border-white/20 transition">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-lg" style={{ background: `${a.accent}1f`, color: a.accent }}>
                      {a.glyph}
                    </span>
                    <div>
                      <div className="font-semibold text-sm">{a.name}</div>
                      <div className="text-[10px] uppercase tracking-widest text-text-tertiary">{a.kind}</div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-text-secondary leading-relaxed">{a.blurb}</p>
                  <div className="mt-3 text-[11px] text-text-tertiary">
                    Powered by <span style={{ color: a.accent }}>{a.poweredBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </PageTop>
  );
}

// ─── AUTOMATION + FLIGHT PLAN ─────────────────────────────────────────────────
const FLIGHT_PLAN: { mark: string; title: string; detail: string; accent: string }[] = [
  { mark: "T-0", title: "You paste one product URL", detail: "That's the entire brief. No kickoff call, no intake form, no sprint planning.", accent: "#00D4FF" },
  { mark: "T+8m", title: "Research + personas", detail: "It scrapes the market, reads your competitors, and builds synthetic buyer personas.", accent: "#00D4FF" },
  { mark: "T+21m", title: "Strategy + first creative", detail: "Drafts the channel + budget plan across Meta, Google & TikTok, then forges the first ad batch with Higgsfield.", accent: "#6C63FF" },
  { mark: "T+44m", title: "Tracking wired honest", detail: "Pixels and CAPI in place, Shopify margin plugged in as ground truth so every decision steers by real profit.", accent: "#FF2E9A" },
  { mark: "T+58m", title: "Campaign live", detail: "It goes live and pings your Slack war room: “It's flying.” Optimization starts today, not next month.", accent: "#C9A84C" },
];

export function Automation() {
  return (
    <PageTop>
      <section id="automation" className="px-6 py-24">
        <div className="container mx-auto max-w-6xl">
          <Reveal className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <div className="text-xs uppercase tracking-[0.3em] text-secondary">── Automation spine · n8n</div>
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight">The loops that run while you sleep.</h2>
            <p className="text-text-secondary text-lg">Every decision Pixel Pilot makes rides a real n8n workflow — importable, auditable, yours. Here are four of the brains on the wing.</p>
          </Reveal>
          <div className="grid lg:grid-cols-2 gap-5">
            {WORKFLOWS.map((w) => (
              <Reveal key={w.id}>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6 h-full">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold">{w.name}</h3>
                    <span className="shrink-0 rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-widest text-secondary">{w.cadence}</span>
                  </div>
                  <p className="mt-2 text-sm text-text-secondary">{w.summary}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-1.5">
                    {w.nodes.map((n, i) => (
                      <span key={n.name} className="flex items-center gap-1.5">
                        <span className="rounded-md border border-white/10 bg-black/30 px-2.5 py-1 text-[11px] text-text-secondary">{n.name}</span>
                        {i < w.nodes.length - 1 && <span className="text-text-tertiary/60 text-xs">→</span>}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="flight-plan" className="px-6 py-24">
        <div className="container mx-auto max-w-5xl">
          <Reveal className="text-center max-w-3xl mx-auto space-y-4 mb-14">
            <div className="text-xs uppercase tracking-[0.3em] text-[#00D4FF]">── The Flight Plan</div>
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight">
              One URL to live ads,
              <br />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRADIENT }}>
                in under 60 minutes.
              </span>
            </h2>
            <p className="text-text-secondary text-lg">The launch agencies take three weeks to fly. Paste a product URL, walk away — Pixel Pilot runs the whole flight plan hands-off, and pings you when it&apos;s airborne.</p>
          </Reveal>
          <ol className="relative mx-auto max-w-3xl">
            <span className="pointer-events-none absolute left-[7px] top-2 bottom-2 w-px md:left-1/2 md:-translate-x-1/2" style={{ background: "linear-gradient(180deg,#00D4FF,#6C63FF,#FF2E9A,#C9A84C)" }} aria-hidden />
            {FLIGHT_PLAN.map((stop, i) => (
              <Reveal key={stop.mark}>
                <li className={`relative flex items-start gap-5 pb-10 md:w-1/2 ${i % 2 === 0 ? "md:pr-10 md:text-right" : "md:ml-auto md:pl-10 md:flex-row-reverse"}`}>
                  <span className={`absolute top-1 left-0 md:left-auto ${i % 2 === 0 ? "md:right-0 md:translate-x-1/2" : "md:left-0 md:-translate-x-1/2"} flex h-4 w-4 items-center justify-center`} aria-hidden>
                    <span className="h-3 w-3 rounded-full" style={{ background: stop.accent, boxShadow: `0 0 16px ${stop.accent}` }} />
                  </span>
                  <div className="pl-8 md:pl-0 md:pr-0">
                    <div className="text-sm font-mono font-semibold tracking-widest tabular-nums" style={{ color: stop.accent }}>
                      {stop.mark}
                    </div>
                    <h3 className="mt-1 text-xl font-semibold leading-tight">{stop.title}</h3>
                    <p className="mt-1.5 text-sm text-text-secondary leading-relaxed">{stop.detail}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
          <Reveal className="text-center mt-4">
            <Link href="/book" className="inline-block rounded-full px-7 py-3 text-sm font-semibold text-white transition hover:opacity-90" style={{ background: "linear-gradient(90deg,#6C63FF,#FF2E9A)" }}>
              Book your zero-to-live launch →
            </Link>
          </Reveal>
        </div>
      </section>
    </PageTop>
  );
}

// ─── PRICING — à la carte services + managed plans ───────────────────────────
export function Pricing() {
  return (
    <PageTop>
      <section id="pricing" className="px-6 py-24">
        <div className="container mx-auto max-w-6xl">
          <Reveal className="text-center max-w-3xl mx-auto space-y-4 mb-14">
            <div className="text-xs uppercase tracking-[0.3em] text-gold">── Services &amp; Pricing</div>
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight">
              Five services.
              <br />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRADIENT }}>
                One autonomous buyer.
              </span>
            </h2>
            <p className="text-text-secondary text-lg">
              The full media-buying department — every service pointed at one niche. Buy a single deliverable
              à la carte, or hand us the whole account with a managed flight plan. No hidden fees — this is the whole menu.
            </p>
          </Reveal>

          {/* THE SERVICES (moved from the former Flight Deck page) */}
          <Reveal className="mb-6 flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.3em] text-[#FF2E9A]">What we fly</span>
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-text-tertiary">the department, in five services</span>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-5">
            {SERVICES.map((s, i) => (
              <Reveal key={s.id} id={s.id} className="[transition-delay:var(--d)]">
                <div className="group relative h-full rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-7 overflow-hidden hover:border-white/20 transition" style={{ ["--d" as string]: `${(i % 2) * 80}ms` }}>
                  <div className="absolute inset-x-0 top-0 h-px opacity-60" style={{ background: `linear-gradient(90deg,transparent,${s.accent},transparent)` }} />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono tracking-widest" style={{ color: s.accent }}>
                          {s.no}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.25em] text-text-tertiary rounded-full border border-white/10 px-2 py-0.5">{s.category}</span>
                      </div>
                      <h3 className="mt-3 text-2xl font-semibold leading-tight">{s.name}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-semibold tabular-nums" style={{ color: s.accent }}>
                        {s.metric.value}
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-text-tertiary">{s.metric.label}</div>
                    </div>
                  </div>
                  <p className="mt-4 text-[15px] font-medium text-text-primary">{s.headline}</p>
                  <p className="mt-2 text-sm text-text-secondary leading-relaxed">{s.body}</p>
                  <div className="mt-4 flex items-center gap-2 text-xs" style={{ color: s.accent }}>
                    <span aria-hidden>◆</span>
                    <span className="text-text-secondary italic">{s.edge}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* À LA CARTE */}
          <Reveal className="mb-6 mt-20 flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.3em] text-[#00D4FF]">Individual services</span>
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-text-tertiary">à la carte — done for you</span>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SERVICE_PRICING.map((s) => (
              <Reveal key={s.id}>
                <div className={`relative flex h-full flex-col rounded-2xl border bg-white/[0.03] backdrop-blur-md p-6 overflow-hidden transition hover:-translate-y-1 ${s.popular ? "border-white/25" : "border-white/10 hover:border-white/20"}`}>
                  <div className="absolute inset-x-0 top-0 h-px opacity-60" style={{ background: `linear-gradient(90deg,transparent,${s.accent},transparent)` }} />
                  {s.popular && (
                    <div className="absolute top-4 right-4 rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.2em]" style={{ borderColor: `${s.accent}55`, color: s.accent }}>
                      Popular
                    </div>
                  )}
                  <h3 className="text-base font-semibold leading-tight pr-16">{s.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    {s.from && <span className="text-xs text-text-tertiary">from</span>}
                    <span className="text-3xl font-semibold tabular-nums" style={{ color: s.accent }}>
                      {s.price}
                    </span>
                    <span className="text-xs text-text-tertiary">{s.unit}</span>
                  </div>
                  <p className="mt-2 text-[13px] text-text-secondary leading-relaxed">{s.tagline}</p>
                  <ul className="mt-4 space-y-1.5">
                    {s.includes.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[13px] text-text-secondary">
                        <span className="mt-1.5 h-1 w-1 rounded-full shrink-0" style={{ background: s.accent }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={s.tool} className="mt-5 w-full text-center rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium hover:border-white/25 transition">
                    Get started →
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>

          {/* MANAGED PLANS */}
          <Reveal className="mb-6 mt-20 flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.3em] text-gold">Managed flight plans</span>
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-text-tertiary">we fly the whole account · retainer + performance</span>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-5 items-stretch">
            {TIERS.map((t) => (
              <Reveal key={t.id}>
                <div className={`relative h-full rounded-2xl border ${t.border} bg-white/[0.03] backdrop-blur-md p-7 flex flex-col overflow-hidden ${t.featured ? "md:-translate-y-3 md:scale-[1.03]" : ""}`}>
                  <div className={`absolute -inset-1 rounded-3xl bg-gradient-to-b ${t.accent} opacity-30 blur-2xl -z-10`} />
                  {t.featured && <div className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.25em] rounded-full bg-primary/20 text-primary border border-primary/30 px-2 py-0.5">Most flown</div>}
                  {t.apex && <div className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.25em] rounded-full bg-gold/20 text-gold border border-gold/30 px-2 py-0.5">Apex</div>}
                  <div className="text-xs uppercase tracking-[0.3em] text-text-tertiary">{t.id}</div>
                  <div className="mt-2 text-2xl font-semibold">{t.name}</div>
                  <div className="mt-1 text-sm text-text-secondary">{t.tagline}</div>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tabular-nums">${t.price.toLocaleString()}</span>
                    <span className="text-sm text-text-tertiary">/mo</span>
                  </div>
                  <div className="mt-1 text-xs text-[#FF2E9A]">{t.performance}</div>
                  <div className="mt-1 text-xs text-text-tertiary">{t.adSpend}</div>
                  <div className="mt-5 space-y-2 text-sm">
                    {t.includes.map((f) => (
                      <div key={f} className="flex items-start gap-2 text-text-secondary">
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-secondary shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto pt-8 text-xs text-text-tertiary">{t.forWho}</div>
                  <Link
                    href="/automator"
                    className={`mt-4 w-full text-center rounded-lg px-6 py-3 text-sm font-semibold transition ${t.featured || t.apex ? "text-white hover:opacity-90" : "border border-white/15 text-text-primary hover:bg-white/5"}`}
                    style={t.featured || t.apex ? { background: "linear-gradient(90deg,#6C63FF,#FF2E9A)" } : undefined}
                  >
                    {t.apex ? "Talk to command" : `Fly with ${t.name}`}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="text-center text-xs text-text-tertiary mt-8">Every managed tier: profit-based reporting, Slack war room, and a 60-minute zero-to-live launch.</Reveal>
        </div>
      </section>
    </PageTop>
  );
}

// ─── RESULTS — the money & customers proof ───────────────────────────────────
export function Results() {
  return (
    <PageTop>
      <section id="results" className="px-6 py-24">
        <div className="container mx-auto max-w-6xl">
          <Reveal className="text-center max-w-3xl mx-auto space-y-4">
            <div className="text-xs uppercase tracking-[0.3em] text-[#10B981]">── Results</div>
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight">
              More customers.
              <br />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRADIENT }}>
                More profit. Proof.
              </span>
            </h2>
            <p className="text-text-secondary text-lg">
              The only question that matters: is this making you money? Here&apos;s exactly how Pixel Pilot brings in more
              buyers and more profit — and what that looks like in the numbers.
            </p>
          </Reveal>

          {/* Outcome band */}
          <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {OUTCOMES.map((o) => (
              <Reveal key={o.label}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6">
                  <div className="text-4xl font-semibold tabular-nums" style={{ color: o.accent }}>
                    {o.value}
                  </div>
                  <div className="mt-1 text-sm font-medium">{o.label}</div>
                  <p className="mt-2 text-[12px] text-text-tertiary leading-relaxed">{o.note}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-3 text-center text-[11px] text-text-tertiary">
            Representative outcomes for a well-run account — not a guarantee. Your mileage depends on offer, margin and market.
          </Reveal>

          {/* How it makes you money */}
          <Reveal className="mt-24 text-center max-w-3xl mx-auto space-y-3">
            <div className="text-xs uppercase tracking-[0.3em] text-[#00D4FF]">── How the money actually shows up</div>
            <h3 className="text-3xl md:text-4xl font-semibold tracking-tight">What we&apos;re doing that grows your revenue.</h3>
          </Reveal>
          <div className="mt-10 grid md:grid-cols-2 gap-5">
            {MONEY_MECHANISM.map((m) => (
              <Reveal key={m.no}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-7">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono tracking-widest" style={{ color: m.accent }}>
                      {m.no}
                    </span>
                    <h4 className="text-xl font-semibold">{m.title}</h4>
                  </div>
                  <p className="mt-3 text-sm text-text-secondary leading-relaxed">{m.plain}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Scenario case studies */}
          <Reveal className="mt-24 text-center max-w-3xl mx-auto space-y-3">
            <div className="text-xs uppercase tracking-[0.3em] text-[#FF2E9A]">── What a flight looks like</div>
            <h3 className="text-3xl md:text-4xl font-semibold tracking-tight">Before &amp; after, by the numbers.</h3>
          </Reveal>
          <div className="mt-10 grid lg:grid-cols-3 gap-5">
            {RESULT_STORIES.map((s) => (
              <Reveal key={s.segment}>
                <div className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6 overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-px opacity-60" style={{ background: `linear-gradient(90deg,transparent,${s.accent},transparent)` }} />
                  <div className="text-[10px] uppercase tracking-[0.25em] text-text-tertiary">{s.segment}</div>
                  <p className="mt-2 text-sm text-text-secondary leading-relaxed">{s.situation}</p>

                  <div className="mt-5 flex items-end justify-between rounded-xl border border-white/10 bg-black/20 p-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-text-tertiary">Before</div>
                      <div className="mt-1 text-lg font-semibold text-text-secondary tabular-nums">{s.before.value}</div>
                      <div className="text-[10px] text-text-tertiary">{s.before.metric}</div>
                    </div>
                    <span className="pb-5 text-lg" style={{ color: s.accent }}>
                      →
                    </span>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-widest text-text-tertiary">After</div>
                      <div className="mt-1 text-2xl font-bold tabular-nums" style={{ color: s.accent }}>
                        {s.after.value}
                      </div>
                      <div className="text-[10px] text-text-tertiary">{s.after.metric}</div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm font-medium">{s.headline}</p>
                  <ul className="mt-3 space-y-1.5">
                    {s.moves.map((m) => (
                      <li key={m} className="flex items-start gap-2 text-[12.5px] text-text-secondary">
                        <span className="mt-1.5 h-1 w-1 rounded-full shrink-0" style={{ background: s.accent }} />
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Why it works + testimonials */}
          <div className="mt-24 grid lg:grid-cols-2 gap-8 items-start">
            <Reveal>
              <div className="text-xs uppercase tracking-[0.3em] text-[#C9A84C] mb-4">── Why it works</div>
              <ul className="space-y-3">
                {PROOF_POINTS.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm text-text-secondary">
                    <span className="mt-0.5 text-[#10B981]">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-2xl border border-[#10B981]/25 bg-[#10B981]/[0.06] p-5">
                <div className="text-sm font-semibold">{GUARANTEE.title}</div>
                <p className="mt-1.5 text-[13px] text-text-secondary leading-relaxed">{GUARANTEE.body}</p>
              </div>
            </Reveal>
            <Reveal>
              <div className="text-xs uppercase tracking-[0.3em] text-text-tertiary mb-4">── In their words</div>
              <div className="space-y-4">
                {TESTIMONIALS.map((t, i) => (
                  <figure key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-5">
                    <blockquote className="text-sm text-text-primary leading-relaxed">“{t.quote}”</blockquote>
                    <figcaption className="mt-3 text-[12px] text-text-tertiary">
                      <span className="text-text-secondary">{t.name}</span> · {t.role}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal className="text-center mt-16 flex flex-wrap justify-center gap-4">
            <Link href="/book" className="inline-block rounded-full px-7 py-3 text-sm font-semibold text-white transition hover:opacity-90" style={{ background: "linear-gradient(90deg,#6C63FF,#FF2E9A)" }}>
              Get more customers →
            </Link>
            <Link href="/growth" className="inline-block rounded-full border border-white/15 px-7 py-3 text-sm font-medium text-text-primary hover:bg-white/5 transition">
              Calculate my growth
            </Link>
          </Reveal>
        </div>
      </section>
    </PageTop>
  );
}

// ─── GROWTH ENGINE — the customer-acquisition promise ─────────────────────────
const GROWTH_PILLARS: { metric: string; label: string; blurb: string; accent: string }[] = [
  { metric: "More", label: "Customers", blurb: "Every campaign is reverse-engineered from one goal: bring you buyers who pay.", accent: "#10B981" },
  { metric: "More", label: "Leads", blurb: "Fresh, native creative and tight targeting fill the top of your funnel — daily.", accent: "#00D4FF" },
  { metric: "Lower", label: "CAC", blurb: "The pilot cuts losers and scales winners by real profit, so each customer costs less.", accent: "#FF2E9A" },
];

export function GrowthEngine() {
  return (
    <section className="px-6 py-24">
      <div className="container mx-auto max-w-6xl">
        <Reveal className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="text-xs uppercase tracking-[0.3em] text-[#10B981]">── The Growth Engine</div>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight">
            Built to bring you{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRADIENT }}>
              new customers.
            </span>
          </h2>
          <p className="text-text-secondary text-lg">
            Pixel Pilot isn&apos;t here to make dashboards pretty. It exists to grow one number — the count of
            customers and leads flowing into your business.
          </p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-5">
          {GROWTH_PILLARS.map((p, i) => (
            <Reveal key={p.label} className="[transition-delay:var(--d)]">
              <div className="group relative h-full rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-7 overflow-hidden hover:-translate-y-1 transition" style={{ ["--d" as string]: `${i * 80}ms` }}>
                <div className="absolute inset-x-0 top-0 h-px opacity-60" style={{ background: `linear-gradient(90deg,transparent,${p.accent},transparent)` }} />
                <div className="text-xs uppercase tracking-[0.25em] text-text-tertiary">{p.metric}</div>
                <div className="mt-1 text-3xl font-semibold" style={{ color: p.accent }}>
                  {p.label}
                </div>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed">{p.blurb}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-12 flex flex-wrap justify-center gap-4">
          <Link href="/book" className="rounded-full px-7 py-3 text-sm font-semibold text-white transition hover:opacity-90" style={{ background: "linear-gradient(90deg,#6C63FF,#FF2E9A)" }}>
            Get more customers →
          </Link>
          <Link href="/growth" className="rounded-full border border-white/15 px-7 py-3 text-sm font-medium text-text-primary hover:bg-white/5 transition">
            See your projected numbers
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

// ─── FINAL CTA ────────────────────────────────────────────────────────────────
export function FinalCTA() {
  return (
    <section id="command" className="px-6 py-32">
      <Reveal className="container mx-auto max-w-3xl text-center space-y-6">
        <h2 className="text-4xl md:text-7xl font-semibold tracking-tight leading-[1.02]">
          Stop managing ads.
          <br />
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRADIENT }}>
            Start flying them.
          </span>
        </h2>
        <p className="text-text-secondary text-lg md:text-xl">Your competitors are still clicking. Put a pilot in the seat and let your spend climb to profit on its own.</p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link href="/book" className="rounded-full px-8 py-3.5 text-sm font-semibold text-white transition hover:opacity-90" style={{ background: "linear-gradient(90deg,#6C63FF,#FF2E9A)" }}>
            Get more customers →
          </Link>
          <Link href="/pricing" className="rounded-full border border-white/15 px-8 py-3.5 text-sm font-medium text-text-primary hover:bg-white/5 transition">
            See pricing
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
