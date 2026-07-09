// ─── PIXEL PILOT · HEALTH ────────────────────────────────────────────────────
// GET /api/pixel-pilot/health
// A single, safe read of backend readiness: is the datastore durable, and which
// env-gated integrations are configured. Returns booleans + counts only — never
// secret values or env var names — so it's safe to hit from a monitor or uptime
// check. Replaces the old debug-env recon route.

import { NextResponse } from 'next/server';
import { CONNECTOR_LIST, connectorIsLive, WORKFLOWS, PIXEL_AGENTS } from '@/pixel-pilot';
import { storeIsDurable } from '@/pixel-pilot/store';
import { aiConfigured } from '@/pixel-pilot/ai';
import { quickbooksConfigured } from '@/pixel-pilot/quickbooks';
import { hubspotConfigured } from '@/pixel-pilot/hubspot';
import { tokenEncryptionConfigured } from '@/pixel-pilot/crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  const connectors = Object.fromEntries(CONNECTOR_LIST.map((c) => [c.id, connectorIsLive(c)]));

  return NextResponse.json({
    ok: true,
    service: 'pixel-pilot',
    time: new Date().toISOString(),
    store: { durable: storeIsDurable() },
    integrations: {
      ai: aiConfigured(),
      hubspot: hubspotConfigured(),
      quickbooks: quickbooksConfigured(),
      higgsfield: Boolean(process.env.HIGGSFIELD_API_KEY),
      n8n: Boolean(process.env.N8N_BASE_URL),
      zapier: Boolean(process.env.ZAPIER_HOOK_URL),
      tokenEncryption: tokenEncryptionConfigured(),
      connectors,
    },
    catalog: {
      agents: PIXEL_AGENTS.length,
      workflows: WORKFLOWS.length,
      connectors: CONNECTOR_LIST.length,
    },
  });
}
