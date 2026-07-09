// ─── PIXEL PILOT · CREATIVE TOOLS & APPS ─────────────────────────────────────
// The in-platform apps a client actually opens. Each is a surface on top of the
// engine (connectors + workflows + Higgsfield) — the "studio" side of the buyer.

export interface CreativeApp {
  readonly id: string;
  readonly name: string;
  readonly kind: 'App' | 'Tool' | 'Copilot';
  readonly blurb: string;
  /** What it plugs into under the hood. */
  readonly poweredBy: string;
  readonly accent: string;
  readonly glyph: string; // single-char mark for the tile
}

export const CREATIVE_APPS: CreativeApp[] = [
  {
    id: 'creative-forge',
    name: 'Creative Forge',
    kind: 'App',
    blurb: 'Drop a product, get a cinematic ad reel in seconds. Motion-first, channel-native, always fresh.',
    poweredBy: 'Pixel Pilot',
    accent: '#FF2E9A',
    glyph: '✦',
  },
  {
    id: 'genome-lab',
    name: 'Genome Lab',
    kind: 'Tool',
    blurb: 'Dissect any winning ad into its genes — hook, pacing, claim — and breed the next one from proof, not guesses.',
    poweredBy: 'Creative Genome',
    accent: '#6C63FF',
    glyph: '⬡',
  },
  {
    id: 'synthetic-arena',
    name: 'Synthetic Arena',
    kind: 'Tool',
    blurb: 'Battle-test up to 500 variants against synthetic buyers before a cent of spend leaves the ground.',
    poweredBy: 'Synthetic Pre-Testing',
    accent: '#C9A84C',
    glyph: '◎',
  },
  {
    id: 'conductor',
    name: 'The Conductor',
    kind: 'App',
    blurb: 'One board across Meta, Google & TikTok. Watch budget flow to the winners, live, every 15 minutes.',
    poweredBy: 'n8n · Budget Reallocation',
    accent: '#00D4FF',
    glyph: '⟁',
  },
  {
    id: 'launch-copilot',
    name: 'Launch Copilot',
    kind: 'Copilot',
    blurb: 'Paste a URL. It researches, builds, wires tracking, and launches — under an hour.',
    poweredBy: 'n8n · Zero-to-Live',
    accent: '#FF6B35',
    glyph: '➤',
  },
  {
    id: 'truth-room',
    name: 'Truth Room',
    kind: 'App',
    blurb: 'Incrementality + MMM in one view. What actually drove revenue, post-ATT — not what the platforms claim.',
    poweredBy: 'Attribution Truth Engine',
    accent: '#33E0FF',
    glyph: '◈',
  },
  {
    id: 'motion-studio',
    name: 'Motion Studio',
    kind: 'App',
    blurb: 'Programmable, on-brand video — explainers, demos and animated ads rendered from HTML at any framerate.',
    poweredBy: 'HyperFrames · HeyGen',
    accent: '#7C5CFF',
    glyph: '▤',
  },
  {
    id: 'brand-frames',
    name: 'Brand Frames',
    kind: 'Tool',
    blurb: 'Instant on-brand key visuals + ad stills, composed to spec with your palette and headline space.',
    poweredBy: 'Gemini · Imagen',
    accent: '#00D4FF',
    glyph: '❖',
  },
];
