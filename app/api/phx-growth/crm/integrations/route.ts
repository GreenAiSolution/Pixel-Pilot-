// ─── PHX GROWTH · CRM INTEGRATION REGISTRY ──────────────────────────────────
// GET /api/phx-growth/crm/integrations → every pipe a client can be attached
// to, each resolved against the project's live configuration:
//   wired   → first-party credentials present (OAuth connector / engine pipe)
//   relay   → reachable now through the Zapier fan-out
//   dormant → known + attachable, activates when its env credentials land
// QuickBooks additionally reports token-level connection (not just env config).

import { NextRequest, NextResponse } from 'next/server';
import { INTEGRATION_REGISTRY, integrationStatus } from '@/phx-growth/crm';
import { isConnected as qbConnected } from '@/phx-growth/quickbooks';
import { deckAllowed } from '@/phx-growth/deck-auth';

export const maxDuration = 10;

export async function GET(req: NextRequest) {
  // Owner-only: reveals which pipes hold live credentials.
  if (!deckAllowed(req)) {
    return NextResponse.json({ ok: false, error: 'Operator access required' }, { status: 401 });
  }
  const qbLive = await qbConnected().catch(() => false);

  const integrations = INTEGRATION_REGISTRY.map((def) => ({
    ...def,
    status: integrationStatus(def),
    // Deeper truth where we have it: env config vs an actual live token.
    connected: def.id === 'quickbooks' ? qbLive : undefined,
  }));

  return NextResponse.json({
    ok: true,
    count: integrations.length,
    wired: integrations.filter((i) => i.status === 'wired').length,
    integrations,
  });
}
