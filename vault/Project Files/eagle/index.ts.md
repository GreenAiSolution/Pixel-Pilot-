---
tags: [pixel-pilot, source]
file: eagle/index.ts
---

# `eagle/index.ts`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/eagle/index.ts`

**Imports** [[Project Files/eagle/agents.ts|agents.ts]] · [[Project Files/eagle/company.ts|company.ts]] · [[Project Files/eagle/quickbooks.ts|quickbooks.ts]] · [[Project Files/eagle/services.ts|services.ts]] · [[Project Files/eagle/workflows.ts|workflows.ts]]

````ts
// ─── EAGLE LANDSCAPING · ENGINE BARREL ───────────────────────────────────────
// One import surface for the Eagle client instance (site + ops dashboard + API).
export * from './company';
export * from './services';
export * from './agents';
export * from './workflows';
export * from './quickbooks';
````
