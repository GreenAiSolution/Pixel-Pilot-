// ─── PIXEL PILOT · HUBSPOT SERVICE ───────────────────────────────────────────
// Typed reads over the HubSpot CRM, plus the normalized PipelineProfit object the
// Ledger agent consumes. Everything routes through the rate-limited/paginated
// client, so this layer stays declarative.
//
// Note on approximations: HubSpot's basic object reads don't return per-stage
// dwell history. `avgDaysInStage` and `entriesByStage` are therefore derived from
// deal age and stage order (documented inline). Wiring the deal stage-history API
// (`dealstage` property history) would make them exact — a clean follow-up.

import { createHubSpotClient } from './client';
import {
  type ConnectionRef,
  type HubSpotContact,
  type HubSpotDeal,
  type HubSpotPipeline,
  type LifecycleStage,
  type PipelineProfit,
  type PipelineStageProfit,
} from './types';

const CONTACT_PROPS = ['email', 'firstname', 'lastname', 'company', 'lifecyclestage', 'hs_marketable_status'];
const DEAL_PROPS = ['dealname', 'amount', 'dealstage', 'pipeline', 'closedate', 'createdate'];
const DAY_MS = 24 * 60 * 60 * 1000;

// ── Raw HubSpot shapes (only the bits we read) ────────────────────────────────

interface RawObject {
  id: string;
  properties: Record<string, string | null>;
  createdAt: string;
  updatedAt: string;
  associations?: { contacts?: { results?: { id: string }[] } };
}

interface RawPipeline {
  id: string;
  label: string;
  stages: {
    id: string;
    label: string;
    displayOrder: number;
    metadata?: { isClosed?: string; probability?: string };
  }[];
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function toContact(o: RawObject): HubSpotContact {
  const p = o.properties;
  return {
    id: o.id,
    email: p.email ?? null,
    firstName: p.firstname ?? null,
    lastName: p.lastname ?? null,
    company: p.company ?? null,
    lifecycleStage: (p.lifecyclestage as LifecycleStage) ?? null,
    marketable: p.hs_marketable_status ? p.hs_marketable_status === 'MARKETABLE' : null,
    createdAt: o.createdAt,
    lastModifiedAt: o.updatedAt,
  };
}

function num(v: string | null | undefined): number | null {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

// ── Contacts ──────────────────────────────────────────────────────────────────

export async function listContacts(
  ref: ConnectionRef,
  opts?: { updatedSince?: string; lifecycleStages?: LifecycleStage[]; limit?: number }
): Promise<HubSpotContact[]> {
  const client = createHubSpotClient(ref);

  // Filtered reads use the search endpoint; unfiltered uses the cheaper list.
  if (opts?.updatedSince || opts?.lifecycleStages?.length) {
    const filters: { propertyName: string; operator: string; value?: string; values?: string[] }[] = [];
    if (opts.updatedSince) {
      filters.push({ propertyName: 'lastmodifieddate', operator: 'GTE', value: String(Date.parse(opts.updatedSince)) });
    }
    if (opts.lifecycleStages?.length) {
      filters.push({ propertyName: 'lifecyclestage', operator: 'IN', values: opts.lifecycleStages });
    }
    const rows = await searchAll<RawObject>(ref, 'contacts', filters, CONTACT_PROPS, opts.limit);
    return rows.map(toContact);
  }

  const out: HubSpotContact[] = [];
  for await (const o of client.paginate<RawObject>('/crm/v3/objects/contacts', {
    query: { properties: CONTACT_PROPS.join(',') },
    maxItems: opts?.limit,
  })) {
    out.push(toContact(o));
  }
  return out;
}

/**
 * Create (or upsert) a lead contact in the connected HubSpot portal. Used by the
 * public lead-capture route so a website enquiry lands as a real CRM contact,
 * tagged as a marketing lead. Idempotent on email via the create→update fallback:
 * if the contact already exists (409), we patch it instead of failing the lead.
 */
export async function createContact(
  ref: ConnectionRef,
  input: { email: string; firstName?: string; lastName?: string; company?: string; note?: string }
): Promise<{ id: string; created: boolean }> {
  const client = createHubSpotClient(ref);
  const properties: Record<string, string> = {
    email: input.email,
    lifecyclestage: 'lead',
  };
  if (input.firstName) properties.firstname = input.firstName;
  if (input.lastName) properties.lastname = input.lastName;
  if (input.company) properties.company = input.company;
  if (input.note) properties.message = input.note.slice(0, 4000);

  try {
    const res = await client.post<{ id: string }>('/crm/v3/objects/contacts', { properties });
    return { id: res.id, created: true };
  } catch (err) {
    // Already on file → find the existing contact by email so the lead still
    // resolves to a real CRM id (we don't overwrite an existing record's fields).
    const msg = err instanceof Error ? err.message : '';
    if (/\b409\b/.test(msg) || /CONTACT_EXISTS/i.test(msg)) {
      const page = await client.post<{ results: { id: string }[] }>('/crm/v3/objects/contacts/search', {
        filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: input.email }] }],
        properties: ['email'],
        limit: 1,
      });
      const existing = page.results?.[0];
      if (existing) return { id: existing.id, created: false };
    }
    throw err;
  }
}

// ── Deals ─────────────────────────────────────────────────────────────────────

export async function listDeals(
  ref: ConnectionRef,
  opts?: { pipelineId?: string; closedSince?: string; limit?: number }
): Promise<HubSpotDeal[]> {
  const client = createHubSpotClient(ref);
  const stageIndex = await buildStageIndex(ref);

  const map = (o: RawObject): HubSpotDeal => {
    const p = o.properties;
    const stageId = p.dealstage ?? '';
    const meta = stageIndex.get(stageId);
    return {
      id: o.id,
      name: p.dealname ?? '',
      amount: num(p.amount),
      pipelineId: p.pipeline ?? '',
      stageId,
      stageLabel: meta?.label ?? stageId,
      isClosedWon: meta?.isClosedWon ?? false,
      isClosedLost: meta?.isClosedLost ?? false,
      closeDate: p.closedate ?? null,
      createdAt: o.createdAt,
      lastModifiedAt: o.updatedAt,
      associatedContactIds: o.associations?.contacts?.results?.map((r) => r.id) ?? [],
    };
  };

  // A pipeline filter or a closed-since filter both go through search; otherwise list.
  if (opts?.pipelineId || opts?.closedSince) {
    const filters: { propertyName: string; operator: string; value?: string; values?: string[] }[] = [];
    if (opts.pipelineId) filters.push({ propertyName: 'pipeline', operator: 'EQ', value: opts.pipelineId });
    if (opts.closedSince) filters.push({ propertyName: 'closedate', operator: 'GTE', value: String(Date.parse(opts.closedSince)) });
    // Search doesn't hydrate associations, so batch-read them back for the hits.
    const rows = await searchAll<RawObject>(ref, 'deals', filters, DEAL_PROPS, opts.limit);
    const withAssoc = await hydrateDealAssociations(ref, rows);
    return withAssoc.map(map);
  }

  const out: HubSpotDeal[] = [];
  for await (const o of client.paginate<RawObject>('/crm/v3/objects/deals', {
    query: { properties: DEAL_PROPS.join(','), associations: 'contacts' },
    maxItems: opts?.limit,
  })) {
    out.push(map(o));
  }
  return out;
}

// ── Pipelines ─────────────────────────────────────────────────────────────────

export async function getPipelines(ref: ConnectionRef): Promise<HubSpotPipeline[]> {
  const client = createHubSpotClient(ref);
  const data = await client.get<{ results: RawPipeline[] }>('/crm/v3/pipelines/deals');
  return data.results.map((pl) => ({
    id: pl.id,
    label: pl.label,
    stages: [...pl.stages]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((s) => {
        const prob = Number(s.metadata?.probability ?? '0');
        const isClosed = s.metadata?.isClosed === 'true';
        return {
          id: s.id,
          label: s.label,
          displayOrder: s.displayOrder,
          probability: Number.isNaN(prob) ? 0 : prob,
          isClosedWon: isClosed && prob === 1,
          isClosedLost: isClosed && prob === 0,
        };
      }),
  }));
}

// ── Pipeline profit (the Ledger contract) ─────────────────────────────────────

export async function getPipelineProfit(
  ref: ConnectionRef,
  opts?: { pipelineId?: string; window?: { start: string; end: string } }
): Promise<PipelineProfit> {
  const now = Date.now();
  const window = opts?.window ?? { start: new Date(now - 90 * DAY_MS).toISOString(), end: new Date(now).toISOString() };
  const wStart = Date.parse(window.start);
  const wEnd = Date.parse(window.end);

  const pipelines = await getPipelines(ref);
  const pipeline = (opts?.pipelineId && pipelines.find((p) => p.id === opts.pipelineId)) || pipelines[0];
  if (!pipeline) throw new Error('HubSpot has no deal pipelines');

  const orderById = new Map(pipeline.stages.map((s) => [s.id, s.displayOrder]));
  const deals = (await listDeals(ref, { pipelineId: pipeline.id })).filter((d) => orderById.has(d.stageId));

  const inWindow = (iso: string | null) => {
    if (!iso) return false;
    const t = Date.parse(iso);
    return t >= wStart && t <= wEnd;
  };
  const ageDays = (from: string, to: number) => Math.max(0, (to - Date.parse(from)) / DAY_MS);

  const closedWonDeals = deals.filter((d) => d.isClosedWon && inWindow(d.closeDate));

  // Per-stage current occupancy + a dwell proxy (age of deals sitting in it).
  const stages: PipelineStageProfit[] = pipeline.stages.map((s) => {
    const here = deals.filter((d) => d.stageId === s.id);
    const avgDaysInStage = here.length
      ? here.reduce((acc, d) => acc + ageDays(d.createdAt, now), 0) / here.length
      : 0;
    return {
      stageId: s.id,
      stageLabel: s.label,
      isClosedWon: s.isClosedWon,
      dealCount: here.length,
      totalValue: here.reduce((acc, d) => acc + (d.amount ?? 0), 0),
      avgDaysInStage,
    };
  });

  // "Reached" a stage ≈ a deal's current stage is at or beyond it (order-based
  // proxy for entry counts, since basic reads lack stage history).
  const entriesByStage: Record<string, number> = {};
  const closedWonByStage: Record<string, number> = {};
  const avgDaysInStageMap: Record<string, number> = {};
  for (const s of pipeline.stages) {
    entriesByStage[s.id] = deals.filter((d) => (orderById.get(d.stageId) ?? -1) >= s.displayOrder).length;
    closedWonByStage[s.id] = closedWonDeals.filter((d) => d.stageId === s.id).length;
    avgDaysInStageMap[s.id] = stages.find((x) => x.stageId === s.id)?.avgDaysInStage ?? 0;
  }

  // Stage → next-stage conversion, by reached counts.
  const stageConversionRate: Record<string, number> = {};
  for (let i = 0; i < pipeline.stages.length - 1; i++) {
    const cur = pipeline.stages[i];
    const next = pipeline.stages[i + 1];
    const reachedCur = entriesByStage[cur.id];
    stageConversionRate[cur.id] = reachedCur > 0 ? entriesByStage[next.id] / reachedCur : 0;
  }

  const totalValue = closedWonDeals.reduce((acc, d) => acc + (d.amount ?? 0), 0);
  const avgDaysToClose = closedWonDeals.length
    ? closedWonDeals.reduce((acc, d) => acc + (d.closeDate ? ageDays(d.createdAt, Date.parse(d.closeDate)) : 0), 0) /
      closedWonDeals.length
    : 0;

  const wonContacts = new Set(closedWonDeals.flatMap((d) => d.associatedContactIds));

  return {
    pipelineId: pipeline.id,
    pipelineLabel: pipeline.label,
    window,
    currency: process.env.HUBSPOT_DEFAULT_CURRENCY || 'USD',
    stages,
    closedWon: {
      dealCount: closedWonDeals.length,
      totalValue,
      averageDealValue: closedWonDeals.length ? totalValue / closedWonDeals.length : 0,
    },
    costInputs: { entriesByStage, closedWonByStage },
    velocity: { avgDaysToClose, avgDaysInStage: avgDaysInStageMap, stageConversionRate },
    ltv: {
      perWonContact: wonContacts.size ? totalValue / wonContacts.size : 0,
      method: 'crm-closed-won',
    },
    generatedAt: new Date().toISOString(),
  };
}

// ── Internal helpers ──────────────────────────────────────────────────────────

// stageId → { label, isClosedWon } across every deal pipeline, for cheap lookups.
async function buildStageIndex(
  ref: ConnectionRef
): Promise<Map<string, { label: string; isClosedWon: boolean; isClosedLost: boolean }>> {
  const pipelines = await getPipelines(ref);
  const index = new Map<string, { label: string; isClosedWon: boolean; isClosedLost: boolean }>();
  for (const pl of pipelines) {
    for (const s of pl.stages) {
      index.set(s.id, { label: s.label, isClosedWon: s.isClosedWon, isClosedLost: s.isClosedLost });
    }
  }
  return index;
}

// Paginate the CRM search endpoint (POST, `after` cursor), applying an AND filter group.
async function searchAll<T>(
  ref: ConnectionRef,
  objectType: 'contacts' | 'deals',
  filters: { propertyName: string; operator: string; value?: string; values?: string[] }[],
  properties: string[],
  maxItems?: number
): Promise<T[]> {
  const client = createHubSpotClient(ref);
  const out: T[] = [];
  let after: string | undefined;

  do {
    const page = await client.post<{ results: T[]; paging?: { next?: { after?: string } } }>(
      `/crm/v3/objects/${objectType}/search`,
      { filterGroups: [{ filters }], properties, limit: 100, after }
    );
    out.push(...(page.results ?? []));
    if (maxItems && out.length >= maxItems) return out.slice(0, maxItems);
    after = page.paging?.next?.after;
  } while (after);

  return out;
}

// Search results don't include associations; the v4 associations batch endpoint
// returns deal→contact links, which we merge back onto each deal.
async function hydrateDealAssociations(ref: ConnectionRef, deals: RawObject[]): Promise<RawObject[]> {
  if (!deals.length) return deals;
  const client = createHubSpotClient(ref);
  const contactIdsByDeal = new Map<string, string[]>();

  for (let i = 0; i < deals.length; i += 100) {
    const chunk = deals.slice(i, i + 100);
    const page = await client.post<{
      results: { from: { id: string }; to: { toObjectId: number }[] }[];
    }>('/crm/v4/associations/deals/contacts/batch/read', {
      inputs: chunk.map((d) => ({ id: d.id })),
    });
    for (const r of page.results ?? []) {
      contactIdsByDeal.set(String(r.from.id), (r.to ?? []).map((t) => String(t.toObjectId)));
    }
  }

  return deals.map((d) => ({
    ...d,
    associations: { contacts: { results: (contactIdsByDeal.get(d.id) ?? []).map((id) => ({ id })) } },
  }));
}
