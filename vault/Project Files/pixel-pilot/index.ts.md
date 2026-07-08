---
tags: [pixel-pilot, source]
file: pixel-pilot/index.ts
---

# `pixel-pilot/index.ts`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/pixel-pilot/index.ts`

**Imports** [[Project Files/pixel-pilot/agents.ts|agents.ts]] · [[Project Files/pixel-pilot/automations.ts|automations.ts]] · [[Project Files/pixel-pilot/connectors.ts|connectors.ts]] · [[Project Files/pixel-pilot/creative-apps.ts|creative-apps.ts]] · [[Project Files/pixel-pilot/higgsfield.ts|higgsfield.ts]] · [[Project Files/pixel-pilot/pricing.ts|pricing.ts]] · [[Project Files/pixel-pilot/proof.ts|proof.ts]] · [[Project Files/pixel-pilot/services.ts|services.ts]] · [[Project Files/pixel-pilot/stack.ts|stack.ts]] · [[Project Files/pixel-pilot/tools.ts|tools.ts]] · [[Project Files/pixel-pilot/workflows.ts|workflows.ts]]

````ts
// ─── PIXEL PILOT · ENGINE BARREL ─────────────────────────────────────────────
// One import surface for the whole product. UI pulls types + data from here;
// API routes pull the wiring helpers. Keeps the boundary between the "engine"
// (this folder) and the "surface" (app/ + components/) crisp.

export * from './connectors';
export * from './services';
export * from './workflows';
export * from './higgsfield';
export * from './creative-apps';
export * from './pricing';
export * from './proof';
export * from './automations';
export * from './agents';
export * from './tools';
export * from './stack';

/** Brand constants shared across the platform. */
export const PIXEL_PILOT = {
  name: 'Pixel Pilot',
  wordmark: 'PIXEL/PILOT',
  promise: 'The autonomous media buyer that flies your ad spend to profit.',
  gradient: 'linear-gradient(90deg, #00D4FF 0%, #6C63FF 45%, #FF2E9A 100%)',
  hues: { cyan: '#00D4FF', violet: '#6C63FF', magenta: '#FF2E9A', gold: '#C9A84C' },
} as const;
````
