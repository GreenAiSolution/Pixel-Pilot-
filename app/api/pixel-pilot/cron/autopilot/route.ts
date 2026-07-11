// ─── PIXEL PILOT · CRON · AUTOPILOT ──────────────────────────────────────────
// GET /api/pixel-pilot/cron/autopilot
// Invoked by the Vercel cron scheduler (see vercel.json) every 15 minutes. This
// is the 24/7 optimization heartbeat: gate the request, run one sweep, return a
// compact receipt. Gated by CRON_SECRET so only the scheduler can fire it.

import { NextRequest } from 'next/server';
import { ok, fail, log, requestId } from '@/pixel-pilot/api';
import { authorizeCron, runAutopilotSweep } from '@/pixel-pilot/cron';

export const dynamic = 'force-dynamic';
// A full sweep may fan out to n8n + Zapier; give it room but stay well under the
// Pro 300s ceiling. The work is I/O-bound and normally finishes in seconds.
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const rid = requestId();
  const auth = authorizeCron(req);
  if (!auth.ok) {
    log('warn', 'cron/autopilot', 'unauthorized cron call', { reason: auth.reason });
    return fail(401, 'Unauthorized', rid);
  }

  try {
    const entry = await runAutopilotSweep();
    log('info', 'cron/autopilot', 'sweep complete', {
      tick: entry.tick,
      mode: entry.mode,
      decisions: entry.decisions.length,
    });
    return ok({ sweep: entry }, rid);
  } catch (err) {
    log('error', 'cron/autopilot', 'sweep failed', { err: err instanceof Error ? err.message : String(err) });
    return fail(500, 'Autopilot sweep failed', rid);
  }
}
