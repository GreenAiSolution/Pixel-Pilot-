---
tags: [pixel-pilot, source]
file: scripts/marketing-angle.mjs
---

# `scripts/marketing-angle.mjs`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/scripts/marketing-angle.mjs`

`````js
#!/usr/bin/env node
// ─── PIXEL PILOT · DAILY MARKETING ANGLE ENGINE ──────────────────────────────
// Deterministic "what do we say today" planner. Given a date, it returns the
// day's strategic angle so the daily marketing routine is a real campaign on a
// rotation — every pillar gets its turn, formats and platforms alternate, and
// nothing repeats until the whole calendar has cycled. Zero deps.
//
// Usage:
//   node scripts/marketing-angle.mjs            # today, JSON
//   node scripts/marketing-angle.mjs --human    # today, readable
//   node scripts/marketing-angle.mjs 2026-07-10 # a specific date
//   node scripts/marketing-angle.mjs --week      # the next 7 days
//
// The routine (the /pixel-pilot-daily-marketing skill) reads this, then writes
// copy + generates a matching visual (scripts/generate-brand-ad.mjs) per slot.

// A 14-slot calendar (two weeks). Each pillar maps to a real service or a
// strategic differentiator, with an alternating format, platform, hook style,
// and the brand-ad concept/format to render for it.
const CALENDAR = [
  { pillar: "Autonomous Media Buyer", service: "autonomous-buyer", theme: "Autonomy",
    hook: "You don't get a login. You get a media buyer.", style: "contrarian-truth",
    format: "X thread", platform: "X", imageConcept: "cockpit", imageFormat: "hero" },
  { pillar: "Profit, not ROAS", service: "profit-optimized", theme: "Economics",
    hook: "Meta will never optimize against its own revenue. We do.", style: "problem-agitate-solve",
    format: "LinkedIn post", platform: "LinkedIn", imageConcept: "ascent", imageFormat: "hero" },
  { pillar: "Creative Genome", service: "creative-genome", theme: "Creative",
    hook: "Winning ads, decoded into genes and recombined.", style: "how-it-works",
    format: "Short-form reel", platform: "TikTok/Reels", imageConcept: "engine", imageFormat: "story" },
  { pillar: "Attribution Truth", service: "attribution-truth", theme: "Intelligence",
    hook: "Finally know what actually drove the sale, post-iOS.", style: "myth-buster",
    format: "X thread", platform: "X", imageConcept: "paperjet", imageFormat: "hero" },
  { pillar: "Zero-to-Live in <60min", service: "zero-to-live", theme: "Autonomy",
    hook: "Point it at a URL. Walk away. Come back to live ads.", style: "demo",
    format: "Demo GIF/video", platform: "LinkedIn", imageConcept: "paperjet", imageFormat: "story" },
  { pillar: "Founder POV", service: null, theme: "Narrative",
    hook: "The agency retainer is dying. Here's what replaces it.", style: "founder-take",
    format: "LinkedIn post", platform: "LinkedIn", imageConcept: "ascent", imageFormat: "feed" },
  { pillar: "Synthetic Pre-Testing", service: "synthetic-testing", theme: "Intelligence",
    hook: "Test 500 ads before you spend $1.", style: "counter-intuitive",
    format: "X thread", platform: "X", imageConcept: "cockpit", imageFormat: "feed" },
  { pillar: "Cross-Channel Conductor", service: "cross-channel", theme: "Orchestration",
    hook: "One brain across Meta, Google & TikTok.", style: "how-it-works",
    format: "Carousel", platform: "LinkedIn", imageConcept: "engine", imageFormat: "hero" },
  { pillar: "Proof / result", service: "profit-optimized", theme: "Proof",
    hook: "+31% blended net margin, hands off the wheel.", style: "case-study",
    format: "LinkedIn post", platform: "LinkedIn", imageConcept: "ascent", imageFormat: "hero" },
  { pillar: "Compliance-Safe Autopilot", service: "compliance-autopilot", theme: "Trust",
    hook: "Scale the niches that get accounts banned — safely.", style: "problem-agitate-solve",
    format: "X thread", platform: "X", imageConcept: "cockpit", imageFormat: "hero" },
  { pillar: "Creative showcase", service: "impression-creative", theme: "Creative",
    hook: "A different ad for every single viewer.", style: "show-dont-tell",
    format: "Higgsfield reel", platform: "TikTok/Reels", imageConcept: "engine", imageFormat: "story" },
  { pillar: "Data Flywheel", service: "data-flywheel", theme: "Intelligence",
    hook: "Every dollar you spend makes it smarter — an asset you own.", style: "moat",
    format: "X thread", platform: "X", imageConcept: "engine", imageFormat: "feed" },
  { pillar: "Objection crusher", service: null, theme: "FAQ",
    hook: "\"Isn't this just another ad tool?\" No — and here's the tell.", style: "faq-rebuttal",
    format: "LinkedIn post", platform: "LinkedIn", imageConcept: "paperjet", imageFormat: "hero" },
  { pillar: "Impression-Level Creative", service: "impression-creative", theme: "Creative",
    hook: "1:1 personalization at the impression, not the segment.", style: "bleeding-edge",
    format: "Short-form reel", platform: "TikTok/Reels", imageConcept: "ascent", imageFormat: "story" },
];

function daysSinceEpoch(d) {
  return Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 86400000);
}

export function angleFor(date = new Date()) {
  const idx = ((daysSinceEpoch(date) % CALENDAR.length) + CALENDAR.length) % CALENDAR.length;
  const slot = CALENDAR[idx];
  return {
    date: date.toISOString().slice(0, 10),
    slot: idx + 1,
    of: CALENDAR.length,
    ...slot,
    render: `npm run gen:ad -- --concept ${slot.imageConcept} --format ${slot.imageFormat} --out out/mktg-${date.toISOString().slice(0, 10)}`,
  };
}

// ── CLI ──────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const human = args.includes("--human");
const week = args.includes("--week");
const dateArg = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));

function printHuman(a) {
  console.log(
    `\n🛰️  ${a.date}  ·  slot ${a.slot}/${a.of}\n` +
      `   Pillar:    ${a.pillar}  (${a.theme})\n` +
      `   Hook:      "${a.hook}"\n` +
      `   Style:     ${a.style}\n` +
      `   Format:    ${a.format}  →  ${a.platform}\n` +
      `   Visual:    ${a.imageConcept} / ${a.imageFormat}\n` +
      `   Render:    ${a.render}\n`
  );
}

if (week) {
  const base = dateArg ? new Date(dateArg + "T00:00:00Z") : new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() + i);
    const a = angleFor(d);
    human ? printHuman(a) : console.log(JSON.stringify(a));
  }
} else {
  const a = angleFor(dateArg ? new Date(dateArg + "T00:00:00Z") : new Date());
  human ? printHuman(a) : console.log(JSON.stringify(a, null, 2));
}

`````
