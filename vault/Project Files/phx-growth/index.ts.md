---
tags: [phx-growth, source]
file: phx-growth/index.ts
---

# `phx-growth/index.ts`

Part of [[📁 Codebase]] — live copy at `~/PHX-Growth/phx-growth/index.ts`

**Imports** [[Project Files/phx-growth/agents.ts|agents.ts]] · [[Project Files/phx-growth/automations.ts|automations.ts]] · [[Project Files/phx-growth/connectors.ts|connectors.ts]] · [[Project Files/phx-growth/creative-apps.ts|creative-apps.ts]] · [[Project Files/phx-growth/higgsfield.ts|higgsfield.ts]] · [[Project Files/phx-growth/pricing.ts|pricing.ts]] · [[Project Files/phx-growth/proof.ts|proof.ts]] · [[Project Files/phx-growth/services.ts|services.ts]] · [[Project Files/phx-growth/stack.ts|stack.ts]] · [[Project Files/phx-growth/tools.ts|tools.ts]] · [[Project Files/phx-growth/workflows.ts|workflows.ts]]

````ts
// ─── PHX GROWTH · ENGINE BARREL ─────────────────────────────────────────────
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
export const PHX_GROWTH = {
  name: 'PHX Growth',
  wordmark: 'PIXEL/PILOT',
  promise: 'The autonomous media buyer that flies your ad spend to profit.',
  gradient: 'linear-gradient(90deg, #00D4FF 0%, #6C63FF 45%, #FF2E9A 100%)',
  hues: { cyan: '#00D4FF', violet: '#6C63FF', magenta: '#FF2E9A', gold: '#C9A84C' },
} as const;
````
