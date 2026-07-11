// ─── PIXEL PILOT · CRON · NURTURE ────────────────────────────────────────────
// GET /api/pixel-pilot/cron/nurture
// Invoked hourly by the Vercel cron scheduler (see vercel.json). Re-engagement
// heartbeat: surfaces leads captured-but-not-converted and confirms the durable
// follow-up cadence is carrying them. Gated by CRON_SECRET.

import { NextRequest } from 'next/server';
import { ok, fail, log, requestId } from '@/pixel-pilot/api';
import { authorizeCron, runNurtureSweep } from '@/pixel-pilot/cron';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const rid = requestId();
  const auth = authorizeCron(req);
  if (!auth.ok) {
    log('warn', 'cron/nurture', 'unauthorized cron call', { reason: auth.reason });
    return fail(401, 'Unauthorized', rid);
  }

  try {
    const entry = await runNurtureSweep();
    log('info', 'cron/nurture', 'sweep complete', { tick: entry.tick, mode: entry.mode });
    return ok({ sweep: entry }, rid);
  } catch (err) {
    log('error', 'cron/nurture', 'sweep failed', { err: err instanceof Error ? err.message : String(err) });
    return fail(500, 'Nurture sweep failed', rid);
  }
}
