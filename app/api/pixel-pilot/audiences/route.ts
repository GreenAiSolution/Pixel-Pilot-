// ─── PIXEL PILOT · AUDIENCE COMPUTE / COMMIT ─────────────────────────────────
// GET  /api/pixel-pilot/audiences?portalId=…  → hashed membership deltas + verdict
// POST /api/pixel-pilot/audiences             → { portalId, runId, decision }
//
// Server-side so raw PII never reaches n8n or the ad platforms — the response
// carries SHA-256 hashes only. The n8n `audience-sync` workflow calls GET to
// compute, applies the deltas to Meta/Google/TikTok behind an approval gate, then
// POSTs decision:'commit' (or 'reject') to advance the snapshot.
//
// When N8N_WEBHOOK_SECRET is set, both verbs require a matching x-pp-signature —
// this endpoint returns audience data, so it should not be open in production.

import { NextRequest, NextResponse } from 'next/server';
import { computeAudienceSpec, commitAudienceRun, rejectAudienceRun } from '@/pixel-pilot/audiences';
import { getConnection, hubspotConfigured } from '@/pixel-pilot/hubspot';

function authorized(req: NextRequest): boolean {
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!secret) return true; // open in local/dev when no secret is configured
  return req.headers.get('x-pp-signature') === secret;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const portalId = req.nextUrl.searchParams.get('portalId');
  if (!portalId) return NextResponse.json({ error: 'portalId required' }, { status: 400 });
  if (!hubspotConfigured()) return NextResponse.json({ error: 'HubSpot not configured' }, { status: 503 });

  const conn = await getConnection(portalId);
  if (!conn) return NextResponse.json({ error: `No HubSpot connection for portal ${portalId}` }, { status: 404 });

  try {
    const spec = await computeAudienceSpec(portalId);
    return NextResponse.json({ ok: true, ...spec });
  } catch (err) {
    console.error('[pixel-pilot] audiences compute failed:', err);
    return NextResponse.json({ ok: false, error: 'compute failed' }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: { portalId?: string; runId?: string; decision?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const { portalId, runId, decision } = body;
  if (!portalId || !runId) {
    return NextResponse.json({ error: 'portalId and runId required' }, { status: 400 });
  }

  if (decision === 'reject') {
    const r = await rejectAudienceRun(portalId, runId);
    return NextResponse.json(r);
  }

  const r = await commitAudienceRun(portalId, runId);
  return NextResponse.json(r, { status: r.ok ? 200 : 409 });
}
