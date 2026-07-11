// ─── PIXEL PILOT · AUTOPILOT STATUS ──────────────────────────────────────────
// GET /api/pixel-pilot/autopilot
// Public, secret-free read of the autopilot heartbeat: the last sweep, a short
// flight-log tail, and a total sweep count. This is the proof surface behind the
// "24/7, with the logs to prove it" claim — safe to hit from the site, the deck,
// or an uptime monitor. Never returns secrets or env var names.

import { NextResponse } from 'next/server';
import { autopilotStatus } from '@/pixel-pilot/cron';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = await autopilotStatus();
  return NextResponse.json({ ok: true, service: 'pixel-pilot', autopilot: status });
}
