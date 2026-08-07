// ─── CLIENT BRAIN · RESOLVER ────────────────────────────────────────────────
// The fleet's single entry point for "who am I operating right now?". Agents and
// routes call getActiveClient(); it returns the tenant named by CLIENT_ID.
//
// The default is the UNCONFIGURED placeholder — the OS ships ready for ANY
// business but tied to NONE. It only runs a real business once CLIENT_ID points
// at a registered tenant. PHX Growth is registered purely as a worked example.

import { UNCONFIGURED } from './_default';
import { PHX_GROWTH } from './reference';
import { isConfigured, type ClientBrain } from './types';

/** All tenants the OS can run. Add a line per installed client. */
export const REGISTRY: Record<string, ClientBrain> = {
  [UNCONFIGURED.id]: UNCONFIGURED,
  [PHX_GROWTH.id]: PHX_GROWTH, // example tenant — not the default
  // [ACME.id]: ACME,          ← stamp a new client here (see TEMPLATE.ts)
};

/** Look up a specific tenant. Falls back to the UNCONFIGURED placeholder so the
 *  system never silently runs a business it wasn't pointed at. */
export function getClient(id?: string): ClientBrain {
  const key = id ?? process.env.CLIENT_ID ?? UNCONFIGURED.id;
  return REGISTRY[key] ?? UNCONFIGURED;
}

/** The tenant the fleet is operating on this run. */
export function getActiveClient(): ClientBrain {
  return getClient();
}

export { UNCONFIGURED, PHX_GROWTH };
export type { ClientBrain } from './types';
export { gate, isConfigured } from './types';
