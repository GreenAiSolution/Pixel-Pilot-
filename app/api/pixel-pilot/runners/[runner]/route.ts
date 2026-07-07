// ─── PIXEL PILOT · RUNNER (autonomous run + status) ──────────────────────────
// POST /api/pixel-pilot/runners/[runner]  → run the runner now with a payload
// GET  /api/pixel-pilot/runners/[runner]  → status, OR an autonomous cron run
//
// One dynamic endpoint fronts all three runners (atlas · iris · ledger). Vercel
// Cron issues a GET on a schedule (see vercel.json) — we detect that via the
// `x-vercel-cron` header (or a matching `Authorization: Bearer <CRON_SECRET>`)
// and execute a full autonomous run. Any other GET returns the runner definition
// plus recent runs. Everything degrades gracefully; a missing integration never
// hard-fails a run — it's recorded as "not configured".

import { NextRequest, NextResponse } from 'next/server';
import { getRunner, runRunner, recentRuns, runnersDurable } from '@/pixel-pilot/runners';

interface RunBody {
  trigger?: string;
  mode?: 'live' | 'simulated';
  payload?: Record<string, unknown>;
}

/** True when this GET is a Vercel Cron invocation we should act on. */
function isCronRequest(req: NextRequest): { cron: boolean; unauthorized: boolean } {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization');
    if (auth === `Bearer ${secret}`) return { cron: true, unauthorized: false };
    // A cron header without the right secret is a spoof — reject it.
    if (req.headers.has('x-vercel-cron')) return { cron: false, unauthorized: true };
    return { cron: false, unauthorized: false };
  }
  return { cron: req.headers.has('x-vercel-cron'), unauthorized: false };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ runner: string }> }) {
  const { runner: id } = await params;
  const runner = getRunner((id ?? '').trim().toLowerCase().slice(0, 40));
  if (!runner) {
    return NextResponse.json({ ok: false, error: `Unknown runner "${id}"` }, { status: 404 });
  }

  const { cron, unauthorized } = isCronRequest(req);
  if (unauthorized) {
    return NextResponse.json({ ok: false, error: 'Unauthorized cron request' }, { status: 401 });
  }

  // Vercel Cron → execute an autonomous run.
  if (cron) {
    const run = await runRunner(runner.id, { trigger: 'cron' });
    return NextResponse.json({ ok: true, runner: runner.id, run });
  }

  // Otherwise → status: the definition + durability + recent runs.
  const runs = await recentRuns(runner.id, 10);
  return NextResponse.json({ ok: true, durable: runnersDurable(), runner, runs });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ runner: string }> }) {
  const { runner: id } = await params;
  const runner = getRunner((id ?? '').trim().toLowerCase().slice(0, 40));
  if (!runner) {
    return NextResponse.json({ ok: false, error: `Unknown runner "${id}"` }, { status: 404 });
  }

  let body: RunBody = {};
  try {
    body = (await req.json()) as RunBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const trigger = (body.trigger ?? 'manual').toString().trim().slice(0, 60) || 'manual';
  const mode = body.mode === 'simulated' || body.mode === 'live' ? body.mode : undefined;
  const payload =
    body.payload && typeof body.payload === 'object' ? (body.payload as Record<string, unknown>) : undefined;

  const run = await runRunner(runner.id, { trigger, mode, payload });
  return NextResponse.json({ ok: true, runner: runner.id, run });
}
