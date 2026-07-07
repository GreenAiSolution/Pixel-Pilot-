// ─── PIXEL PILOT · RUNNERS INDEX ─────────────────────────────────────────────
// GET /api/pixel-pilot/runners → the full runner registry + recent runs across
// all three (atlas · iris · ledger). This is the read model behind the ops
// dashboard. Static registry always renders; recent runs come from the store
// (durable when KV is configured, in-memory otherwise).

import { NextResponse } from 'next/server';
import { PIXEL_PILOT_RUNNERS, recentRunsAll, runnersDurable } from '@/pixel-pilot/runners';

export async function GET() {
  const recent = await recentRunsAll(6);
  return NextResponse.json({
    ok: true,
    durable: runnersDurable(),
    runners: PIXEL_PILOT_RUNNERS,
    recent,
  });
}
