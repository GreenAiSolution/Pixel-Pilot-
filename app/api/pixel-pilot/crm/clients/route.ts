// ─── PIXEL PILOT · CRM CLIENTS ───────────────────────────────────────────────
// GET  /api/pixel-pilot/crm/clients → roster + command summary
// POST /api/pixel-pilot/crm/clients → acquire a client and wire the engine:
//   1. persist the record (durable via KV when configured)
//   2. fan the acquisition out through Zapier (`crm.client.added`)
//   3. fire the n8n client-onboarding workflow
//   4. if QuickBooks is connected, mint the client as a real QBO customer
// Every side-effect returns a receipt and degrades gracefully — an unconfigured
// pipe never blocks the acquisition.

import { NextRequest, NextResponse } from 'next/server';
import { guard, ok, fail, log } from '@/pixel-pilot/api';
import {
  createClient,
  listClients,
  summarize,
  isStageId,
  CLIENT_SOURCES,
  type ClientSource,
  type StageId,
} from '@/pixel-pilot/crm';
import { fireZapier, triggerWorkflow, type Receipt } from '@/pixel-pilot/executor';
import { isConnected as qbConnected, createCustomer as qbCreateCustomer } from '@/pixel-pilot/quickbooks';
import { deckAllowed } from '@/pixel-pilot/deck-auth';

export const maxDuration = 20;

// Owner-only: the roster is business data. Cookie (deck login) or x-deck-key.
export async function GET(req: NextRequest) {
  if (!deckAllowed(req)) {
    return NextResponse.json({ ok: false, error: 'Operator access required' }, { status: 401 });
  }
  const roster = await listClients();
  return NextResponse.json({ ok: true, summary: summarize(roster), clients: roster });
}

export async function POST(req: NextRequest) {
  if (!deckAllowed(req)) {
    return NextResponse.json({ ok: false, error: 'Operator access required' }, { status: 401 });
  }
  const g = await guard(req, {
    source: 'crm',
    bucket: 'crm-create',
    limit: 30,
    windowSec: 60,
    schema: {
      name: { type: 'string', required: true, maxLen: 120 },
      company: { type: 'string', required: true, maxLen: 160 },
      email: { type: 'string', maxLen: 200 },
      phone: { type: 'string', maxLen: 40 },
      website: { type: 'string', maxLen: 300 },
      industry: { type: 'string', maxLen: 80 },
      monthlySpend: { type: 'number', max: 100_000_000 },
      retainer: { type: 'number', max: 10_000_000 },
      stage: { type: 'string', maxLen: 20 },
      source: { type: 'string', maxLen: 20 },
      notes: { type: 'string', maxLen: 2_000 },
      integrations: { type: 'array', maxLen: 30 },
      squad: { type: 'array', maxLen: 15 },
      tags: { type: 'array', maxLen: 20 },
    },
  });
  if (!g.ok) return g.response;
  const b = g.body;

  const stage = typeof b.stage === 'string' && isStageId(b.stage) ? (b.stage as StageId) : undefined;
  const source = CLIENT_SOURCES.includes(b.source as ClientSource) ? (b.source as ClientSource) : undefined;
  const integrations = Array.isArray(b.integrations)
    ? (b.integrations as unknown[])
        .map((i) =>
          typeof i === 'string'
            ? { id: i }
            : i && typeof i === 'object'
              ? {
                  id: String((i as Record<string, unknown>).id ?? ''),
                  externalRef:
                    typeof (i as Record<string, unknown>).externalRef === 'string'
                      ? ((i as Record<string, unknown>).externalRef as string).slice(0, 300)
                      : undefined,
                }
              : { id: '' }
        )
        .filter((i) => i.id)
    : undefined;

  const client = await createClient({
    name: b.name as string,
    company: b.company as string,
    email: b.email as string | undefined,
    phone: b.phone as string | undefined,
    website: b.website as string | undefined,
    industry: b.industry as string | undefined,
    monthlySpend: b.monthlySpend as number | undefined,
    retainer: b.retainer as number | undefined,
    stage,
    source,
    integrations,
    squad: Array.isArray(b.squad) ? (b.squad as string[]).map(String) : undefined,
    tags: Array.isArray(b.tags) ? (b.tags as string[]).map(String).slice(0, 20) : undefined,
    notes: b.notes as string | undefined,
  });

  // Fire the engine — receipts record what actually happened on each pipe.
  const receipts: Receipt[] = [];
  receipts.push(
    await fireZapier('crm.client.added', {
      clientId: client.id,
      company: client.company,
      name: client.name,
      stage: client.stage,
      source: client.source,
      integrations: client.integrations.map((i) => i.id),
    })
  );
  receipts.push(await triggerWorkflow('client-onboarding', { clientId: client.id, company: client.company }));

  if (client.integrations.some((i) => i.id === 'quickbooks')) {
    try {
      if (await qbConnected()) {
        const customer = await qbCreateCustomer({
          name: client.name,
          email: client.email,
          phone: client.phone,
          notes: `Pixel Pilot CRM · ${client.company} · ${client.id}`,
        });
        receipts.push({
          target: 'quickbooks',
          configured: true,
          ok: Boolean(customer),
          detail: customer ? `QuickBooks customer created: ${customer.name}` : 'Token present but no customer returned',
        });
      } else {
        receipts.push({
          target: 'quickbooks',
          configured: false,
          ok: false,
          detail: 'QuickBooks not connected — connect at /api/pixel-pilot/connectors/quickbooks',
        });
      }
    } catch (err) {
      receipts.push({
        target: 'quickbooks',
        configured: true,
        ok: false,
        detail: err instanceof Error ? err.message : 'QuickBooks customer creation failed',
      });
    }
  }

  log('info', 'crm', 'client acquired', { clientId: client.id, company: client.company, source: client.source });
  return ok({ client, receipts }, g.rid, { status: 201 });
}
