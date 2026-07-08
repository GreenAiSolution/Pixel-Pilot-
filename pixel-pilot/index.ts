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
export * from './stack';
// NOTE: ./hubspot and ./crypto are SERVER-ONLY (node:crypto, secrets, token store)
// and are intentionally not re-exported here — the barrel is imported by client
// components. Import them directly from '@/pixel-pilot/hubspot' / '@/pixel-pilot/crypto'
// (same pattern as ./quickbooks).

/** Brand constants shared across the platform. */
export const PIXEL_PILOT = {
  name: 'Pixel Pilot',
  wordmark: 'PIXEL/PILOT',
  promise: 'The autonomous media buyer that flies your ad spend to profit.',
  gradient: 'linear-gradient(90deg, #00D4FF 0%, #6C63FF 45%, #FF2E9A 100%)',
  hues: { cyan: '#00D4FF', violet: '#6C63FF', magenta: '#FF2E9A', gold: '#C9A84C' },
} as const;
