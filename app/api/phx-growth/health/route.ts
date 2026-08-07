// ─── PHX GROWTH · HEALTH ────────────────────────────────────────────────────
// GET /api/phx-growth/health
// A single, safe read of backend readiness: is the datastore durable, and which
// env-gated integrations are configured. Returns booleans + counts only — never
// secret values or env var names — so it's safe to hit from a monitor or uptime
// check. Replaces the old debug-env recon route.

import { NextResponse } from 'next/server';
import { CONNECTOR_LIST, connectorIsLive, WORKFLOWS, PIXEL_AGENTS } from '@/phx-growth';
import { storeIsDurable } from '@/phx-growth/store';
import { aiConfigured } from '@/phx-growth/ai';
import { emailConfigured } from '@/phx-growth/quote';
import { quickbooksConfigured } from '@/phx-growth/quickbooks';
import { hubspotConfigured } from '@/phx-growth/hubspot';
import { tokenEncryptionConfigured } from '@/phx-growth/crypto';
import { listClients, summarize, INTEGRATION_REGISTRY } from '@/phx-growth/crm';
import { deckKeyConfigured } from '@/phx-growth/deck-auth';
import { cronConfigured, autopilotStatus } from '@/phx-growth/cron';

export const dynamic = 'force-dynamic';

export async function GET() {
  const connectors = Object.fromEntries(CONNECTOR_LIST.map((c) => [c.id, connectorIsLive(c)]));

  return NextResponse.json({
    ok: true,
    service: 'phx-growth',
    time: new Date().toISOString(),
    store: { durable: storeIsDurable() },
    integrations: {
      ai: aiConfigured(),
      resend: emailConfigured(),
      hubspot: hubspotConfigured(),
      quickbooks: quickbooksConfigured(),
      higgsfield: Boolean(process.env.HIGGSFIELD_API_KEY),
      n8n: Boolean(process.env.N8N_BASE_URL),
      zapier: Boolean(process.env.ZAPIER_HOOK_URL),
      tokenEncryption: tokenEncryptionConfigured(),
      deckKey: deckKeyConfigured(),
      cron: cronConfigured(),
      connectors,
    },
    catalog: {
      agents: PIXEL_AGENTS.length,
      workflows: WORKFLOWS.length,
      connectors: CONNECTOR_LIST.length,
      crmIntegrations: INTEGRATION_REGISTRY.length,
    },
    crm: await listClients()
      .then((roster) => {
        const s = summarize(roster);
        return { clients: s.totalClients, active: s.activeClients, avgHealth: s.avgHealth };
      })
      .catch(() => null),
    autopilot: await autopilotStatus()
      .then((s) => ({
        secured: s.cronSecured,
        durable: s.durable,
        totalSweeps: s.totalSweeps,
        lastRunAt: s.lastRun?.at ?? null,
        lastMode: s.lastRun?.mode ?? null,
      }))
      .catch(() => null),
  });
}
