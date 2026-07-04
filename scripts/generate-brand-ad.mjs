#!/usr/bin/env node
// ─── PIXEL PILOT · GEMINI BRAND-AD GENERATOR ─────────────────────────────────
// Generates an on-brand, ad-ready image with Google's Gemini image models.
// Zero dependencies — uses Node's built-in fetch (Node 18+). No SDK to install.
//
// Setup:
//   export GEMINI_API_KEY=...        # from https://aistudio.google.com/apikey
//
// Usage:
//   node scripts/generate-brand-ad.mjs                         # default: hero concept, 16:9
//   node scripts/generate-brand-ad.mjs --format story         # 9:16 for Reels/TikTok/Stories
//   node scripts/generate-brand-ad.mjs --concept ascent       # pick a concept (see CONCEPTS)
//   node scripts/generate-brand-ad.mjs --model imagen-4.0-generate-001
//   node scripts/generate-brand-ad.mjs --prompt "your own prompt override"
//   node scripts/generate-brand-ad.mjs --n 3 --out out/ad      # 3 variants → out/ad-1.png…
//
// Models:
//   gemini-2.5-flash-image   (default, "Nano Banana") — fast, great for text/logo-aware ads
//   imagen-4.0-generate-001  — Imagen 4, highest fidelity; supports true aspectRatio + N images
//   imagen-4.0-fast-generate-001 — cheaper/faster Imagen

// ── Brand system (mirrors app/globals.css + the engine's brand constants) ────
const BRAND = {
  name: "Pixel Pilot",
  wordmark: "PIXEL / PILOT",
  promise: "The autonomous media buyer that flies your ad spend to profit.",
  // Signature gradient + palette
  cyan: "#00D4FF",
  violet: "#6C63FF",
  magenta: "#FF2E9A",
  gold: "#C9A84C",
  ember: "#FF6B35",
  space: "#05060f", // deep-space background
  voice: [
    "premium, cinematic, high-end SaaS / aerospace",
    "aviation & flight metaphor (autopilot, cockpit, ascent, trajectory)",
    "confident and aspirational, never cluttered or clip-arty",
  ],
};

// ── Ad-effectiveness rules (baked into every prompt) ─────────────────────────
const AD_RULES = [
  "ONE clear hero focal point, instantly readable at a glance and on a small phone screen",
  "strong figure-to-ground contrast; the subject pops off the dark background",
  "deliberate empty negative space in one region (top-left or upper-third) reserved for a headline + logo overlay — do NOT fill the whole frame",
  "rule-of-thirds composition, cinematic depth, dramatic rim/edge lighting and subtle lens bloom",
  "premium 3D product-render / octane look; crisp, glossy, high production value",
  "brand palette ONLY: electric cyan, electric violet, hot magenta, with deep-space navy-black background and tasteful gold accents",
  "no literal text, no gibberish letters, no watermarks, no UI chrome, no stock-photo people",
  "scroll-stopping and emotionally aspirational — sells effortless growth and control",
];

// ── Creative concepts (the hero idea) ────────────────────────────────────────
const CONCEPTS = {
  ascent:
    "A sleek, luminous arrow-craft made of flowing cyan-to-violet-to-magenta light, climbing a steep glowing trajectory line — an ascending profit curve rendered as a flight path — arcing upward over a dark, abstract map of advertising platforms. It trails sparks and fine particles of light. Cinematic wide shot, deep-space navy background, volumetric glow.",
  cockpit:
    "A minimalist, futuristic autonomous cockpit view: a single elegant holographic HUD dial glowing in cyan and magenta, floating over a dark dashboard, one clean rising performance line sweeping across it. Calm, in-control, premium aerospace feel. Soft volumetric light, deep-space background, lots of clean negative space.",
  paperjet:
    "A single origami-style paper plane forged from liquid chrome and neon cyan-violet-magenta light, banking gracefully upward, leaving a glowing gradient contrail that curves like a rising graph. Hero product-render on a deep-space navy backdrop, dramatic rim light, floating particles.",
  engine:
    "A glowing turbine/engine core of concentric neon rings in cyan, violet and magenta, pulling in scattered dim ad impressions and firing out a focused beam of bright light and gold sparks — the 'autonomous media buyer' as a jet engine of growth. Dark cinematic background, high-gloss 3D render, strong central focal point with negative space around it.",
};

// ── Aspect formats for common ad placements ──────────────────────────────────
const FORMATS = {
  hero: { ratio: "16:9", note: "landscape hero / web banner" },
  feed: { ratio: "1:1", note: "square feed post (Meta/IG)" },
  story: { ratio: "9:16", note: "vertical Story/Reel/TikTok" },
  wide: { ratio: "21:9", note: "ultra-wide cinematic banner" },
};

// ── CLI parsing ──────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const a = { format: "hero", concept: "ascent", model: "gemini-2.5-flash-image", n: 1, out: "out/pixel-pilot-ad", prompt: null };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    const v = argv[i + 1];
    if (k === "--format") (a.format = v), i++;
    else if (k === "--concept") (a.concept = v), i++;
    else if (k === "--model") (a.model = v), i++;
    else if (k === "--n") (a.n = Math.max(1, parseInt(v, 10) || 1)), i++;
    else if (k === "--out") (a.out = v), i++;
    else if (k === "--prompt") (a.prompt = v), i++;
    else if (k === "--help" || k === "-h") a.help = true;
  }
  return a;
}

function buildPrompt(concept, format) {
  const fmt = FORMATS[format] || FORMATS.hero;
  const hero = CONCEPTS[concept] || CONCEPTS.ascent;
  return [
    `Design a premium advertising key-visual for "${BRAND.name}" — ${BRAND.promise}`,
    ``,
    `HERO CONCEPT: ${hero}`,
    ``,
    `BRAND VOICE: ${BRAND.voice.join("; ")}.`,
    `PALETTE: electric cyan ${BRAND.cyan}, electric violet ${BRAND.violet}, hot magenta ${BRAND.magenta}, gold accent ${BRAND.gold}, on a deep-space navy-black ${BRAND.space}. The cyan→violet→magenta gradient is the signature.`,
    ``,
    `ART DIRECTION for an EFFECTIVE ad:`,
    ...AD_RULES.map((r) => `• ${r}`),
    ``,
    `FORMAT: ${fmt.ratio} aspect ratio (${fmt.note}). Compose for this frame.`,
    `Output a single, finished, campaign-ready image.`,
  ].join("\n");
}

// ── Gemini calls ─────────────────────────────────────────────────────────────
const API = "https://generativelanguage.googleapis.com/v1beta/models";

async function generateWithFlash({ apiKey, model, prompt, ratio }) {
  const res = await fetch(`${API}/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: ratio } },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${model} → ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const img = parts.find((p) => p.inlineData?.data);
  if (!img) throw new Error(`No image in response: ${JSON.stringify(data).slice(0, 400)}`);
  return [Buffer.from(img.inlineData.data, "base64")];
}

async function generateWithImagen({ apiKey, model, prompt, ratio, n }) {
  const res = await fetch(`${API}/${model}:predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: { sampleCount: n, aspectRatio: ratio, personGeneration: "dont_allow" },
    }),
  });
  if (!res.ok) throw new Error(`Imagen ${model} → ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const preds = data?.predictions ?? [];
  if (!preds.length) throw new Error(`No image in response: ${JSON.stringify(data).slice(0, 400)}`);
  return preds.map((p) => Buffer.from(p.bytesBase64Encoded, "base64"));
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log("See the header of this file for usage. Concepts:", Object.keys(CONCEPTS).join(", "),
      "| Formats:", Object.keys(FORMATS).join(", "));
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("✗ Set GEMINI_API_KEY (get one at https://aistudio.google.com/apikey).");
    process.exit(1);
  }

  const fmt = FORMATS[args.format] || FORMATS.hero;
  const prompt = args.prompt || buildPrompt(args.concept, args.format);
  const isImagen = /^imagen/i.test(args.model);

  console.log(`\n🛰️  Pixel Pilot ad generator`);
  console.log(`   model:   ${args.model}${isImagen ? " (Imagen)" : " (Flash Image)"}`);
  console.log(`   concept: ${args.prompt ? "custom prompt" : args.concept}`);
  console.log(`   format:  ${args.format} (${fmt.ratio}) · ${fmt.note}`);
  console.log(`   variants:${args.n}\n`);
  console.log(`── Prompt ─────────────────────────────────────────\n${prompt}\n───────────────────────────────────────────────────\n`);

  const { mkdir, writeFile } = await import("node:fs/promises");
  const { dirname } = await import("node:path");

  const buffers = [];
  if (isImagen) {
    buffers.push(...(await generateWithImagen({ apiKey, model: args.model, prompt, ratio: fmt.ratio, n: args.n })));
  } else {
    // Flash Image returns one image per call — loop for N variants.
    for (let i = 0; i < args.n; i++) {
      buffers.push(...(await generateWithFlash({ apiKey, model: args.model, prompt, ratio: fmt.ratio })));
    }
  }

  await mkdir(dirname(args.out), { recursive: true }).catch(() => {});
  const paths = [];
  for (let i = 0; i < buffers.length; i++) {
    const p = buffers.length === 1 ? `${args.out}.png` : `${args.out}-${i + 1}.png`;
    await writeFile(p, buffers[i]);
    paths.push(p);
  }
  console.log(`✓ Saved ${paths.length} image(s):\n${paths.map((p) => "   " + p).join("\n")}\n`);
}

main().catch((err) => {
  console.error("\n✗ Generation failed:", err.message);
  process.exit(1);
});
