// ─── PIXEL PILOT · CRM CLIENT (single) ───────────────────────────────────────
// GET    /api/pixel-pilot/crm/clients/:id → one client record
// PATCH  /api/pixel-pilot/crm/clients/:id → edit fields, advance stage,
//        link/unlink integrations, log timeline events (health recomputed)
// DELETE /api/pixel-pilot/crm/clients/:id → remove from the roster
// Stage advances and integration changes fan out through Zapier so the rest of
// the client's stack hears about them.

import { NextRequest, NextResponse } from 'next/server';
import { guard, ok, fail, requestId } from '@/pixel-pilot/api';
import {
  getClient,
  updateClient,
  deleteClient,
  isStageId,
  type ClientPatch,
  type StageId,
} from '@/pixel-pilot/crm';
import { fireZapier } from '@/pixel-pilot/executor';
import { deckAllowed } from '@/pixel-pilot/deck-auth';

export const maxDuration = 15;

type Ctx = { params: Promise<{ id: string }> };

const denied = () => NextResponse.json({ ok: false, error: 'Operator access required' }, { status: 401 });

export async function GET(req: NextRequest, ctx: Ctx) {
  if (!deckAllowed(req)) return denied();
  const { id } = await ctx.params;
  const client = await getClient(id);
  if (!client) return NextResponse.json({ ok: false, error: 'Client not found' }, { status: 404 });
  return NextResponse.json({ ok: true, client });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  if (!deckAllowed(req)) return denied();
  const { id } = await ctx.params;
  const g = await guard(req, {
    source: 'crm',
    bucket: 'crm-update',
    limit: 60,
    windowSec: 60,
    schema: {
      name: { type: 'string', maxLen: 120 },
      company: { type: 'string', maxLen: 160 },
      email: { type: 'string', maxLen: 200 },
      phone: { type: 'string', maxLen: 40 },
      website: { type: 'string', maxLen: 300 },
      industry: { type: 'string', maxLen: 80 },
      monthlySpend: { type: 'number', max: 100_000_000 },
      retainer: { type: 'number', max: 10_000_000 },
      stage: { type: 'string', maxLen: 20 },
      notes: { type: 'string', maxLen: 2_000 },
      unlinkIntegration: { type: 'string', maxLen: 40 },
      tags: { type: 'array', maxLen: 20 },
      squad: { type: 'array', maxLen: 15 },
    },
  });
  if (!g.ok) return g.response;
  const b = g.body;

  const before = await getClient(id);
  if (!before) return fail(404, 'Client not found', g.rid);

  const patch: ClientPatch = {
    name: b.name as string | undefined,
    company: b.company as string | undefined,
    email: b.email as string | undefined,
    phone: b.phone as string | undefined,
    website: b.website as string | undefined,
    industry: b.industry as string | undefined,
    monthlySpend: b.monthlySpend as number | undefined,
    retainer: b.retainer as number | undefined,
    notes: b.notes as string | undefined,
    tags: Array.isArray(b.tags) ? (b.tags as string[]).map(String).slice(0, 20) : undefined,
    squad: Array.isArray(b.squad) ? (b.squad as string[]).map(String) : undefined,
    unlinkIntegration: b.unlinkIntegration as string | undefined,
  };

  if (typeof b.stage === 'string') {
    if (!isStageId(b.stage)) return fail(400, `Unknown stage: ${b.stage}`, g.rid);
    patch.stage = b.stage as StageId;
  }

  // linkIntegration + logEvent arrive as objects — validated by hand.
  const link = b.linkIntegration;
  if (link && typeof link === 'object') {
    const l = link as Record<string, unknown>;
    patch.linkIntegration = {
      id: String(l.id ?? '').slice(0, 40),
      externalRef: typeof l.externalRef === 'string' ? l.externalRef.slice(0, 300) : undefined,
    };
  }
  const ev = b.logEvent;
  if (ev && typeof ev === 'object') {
    const e = ev as Record<string, unknown>;
    if (typeof e.summary === 'string' && e.summary.trim()) {
      const kinds = ['note', 'mission', 'signal'] as const;
      const kind = kinds.includes(e.kind as (typeof kinds)[number]) ? (e.kind as (typeof kinds)[number]) : 'note';
      patch.logEvent = { kind, summary: e.summary.trim().slice(0, 500) };
    }
  }

  const client = await updateClient(id, patch);
  if (!client) return fail(404, 'Client not found', g.rid);

  // Broadcast meaningful transitions to the client's wider stack.
  if (patch.stage && patch.stage !== before.stage) {
    await fireZapier('crm.client.stage', {
      clientId: client.id,
      company: client.company,
      from: before.stage,
      to: client.stage,
    });
  }

  return ok({ client }, g.rid);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  if (!deckAllowed(req)) return denied();
  const { id } = await ctx.params;
  const rid = requestId();
  const removed = await deleteClient(id);
  if (!removed) return fail(404, 'Client not found', rid);
  return ok({ removed: id }, rid);
}
