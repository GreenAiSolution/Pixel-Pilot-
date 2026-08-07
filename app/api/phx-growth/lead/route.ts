// ─── PHX GROWTH · LEAD INTAKE ───────────────────────────────────────────────
// POST /api/phx-growth/lead
// The live front door for new customers. Captures a "get more customers" request
// from the /book flow and fans it out, every hop optional and non-blocking:
//   1 · HubSpot   — create/find the contact as a marketing `lead` (native OAuth)
//   2 · Quote     — Claude drafts a personalized reply with a real price from the
//                   catalog; Resend delivers it to the lead + alerts the owner
//   3 · Zapier    — POST to PHX_GROWTH_LEAD_HOOK_URL (Slack #leads, Gmail, Sheets…)
//   4 · Store     — always append to the durable/in-memory lead list
// Degrades gracefully: with nothing configured it still captures the lead and
// reports what *would* route, so the site never drops a customer.

import { NextRequest } from 'next/server';
import { guard, ok, fail, log } from '@/phx-growth/api';
import { pushToList } from '@/phx-growth/store';
import { fetchWithTimeout } from '@/phx-growth/http';
import { hubspotConfigured, getConnection, createContact } from '@/phx-growth/hubspot';
import { draftQuote, sendQuoteEmail, sendOwnerAlert, emailConfigured } from '@/phx-growth/quote';
import { start } from 'workflow/api';
import { leadFollowUp } from '@/workflows/lead-follow-up';

// Drafting the quote is one Claude call (~5-20s); leave headroom on top of it.
export const maxDuration = 60;

function splitName(full: string): { firstName?: string; lastName?: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 0) return {};
  if (parts.length === 1) return { firstName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

export async function POST(req: NextRequest) {
  const g = await guard(req, {
    source: 'phx-growth/lead',
    bucket: 'lead',
    limit: 10,
    windowSec: 60,
    schema: {
      name: { type: 'string', required: true, maxLen: 120 },
      email: { type: 'string', required: true, maxLen: 160 },
      company: { type: 'string', maxLen: 160 },
      website: { type: 'string', maxLen: 300 },
      goal: { type: 'string', maxLen: 200 },
      monthlySpend: { type: 'string', maxLen: 60 },
      details: { type: 'string', maxLen: 1200 },
    },
  });
  if (!g.ok) return g.response;
  const b = g.body as Record<string, string>;

  const email = (b.email ?? '').toString().trim();
  // Cheap sanity check — the schema already trimmed + length-capped.
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return fail(400, 'A valid email is required', g.rid);
  }

  const name = (b.name ?? '').toString().trim();
  const { firstName, lastName } = splitName(name);
  const company = (b.company ?? '').toString().trim();
  const website = (b.website ?? '').toString().trim();
  const goal = (b.goal ?? '').toString().trim() || 'More customers';
  const monthlySpend = (b.monthlySpend ?? '').toString().trim();
  const details = (b.details ?? '').toString().trim();

  const lead = {
    source: 'phx-growth-website',
    receivedAt: new Date().toISOString(),
    name,
    email,
    company,
    website,
    goal,
    monthlySpend,
    details,
  };

  const routed: string[] = [];

  // Always capture first — persistence never blocks the response for long, and a
  // downstream failure must never lose the lead.
  await pushToList('pp:leads', lead).catch(() => {});
  routed.push('Captured to flight log');

  // 1 · HubSpot — create the contact as a marketing lead, if a portal is connected.
  let hubspot: { id: string; created: boolean } | null = null;
  const note =
    `Goal: ${goal}` +
    (monthlySpend ? ` · Monthly spend: ${monthlySpend}` : '') +
    (website ? ` · Site: ${website}` : '') +
    (details ? `\n${details}` : '');
  if (hubspotConfigured()) {
    const portal = process.env.HUBSPOT_DEFAULT_PORTAL_ID;
    if (portal && (await getConnection(portal))) {
      try {
        hubspot = await createContact(portal, { email, firstName, lastName, company, note });
        routed.push(`HubSpot contact #${hubspot.id}${hubspot.created ? '' : ' (existing)'}`);
      } catch (err) {
        log('warn', 'phx-growth/lead', 'hubspot create failed', { err: err instanceof Error ? err.message : String(err) });
      }
    }
  }

  // 2 · Personalized quote — draft with the real catalog, deliver via Resend.
  // Failures are logged, never surfaced: the lead is already captured above.
  let quoted: { plan: string; price: string; messageId: string } | null = null;
  if (emailConfigured()) {
    try {
      const quote = await draftQuote(lead);
      const messageId = await sendQuoteEmail(lead, quote);
      quoted = { plan: quote.recommendedPlan.name, price: quote.recommendedPlan.price, messageId };
      routed.push(`Personalized quote emailed (${quote.recommendedPlan.name})`);
      await sendOwnerAlert(lead, quote).catch(() => null);
      // Durable follow-up cadence (day 2 + day 6) — a Workflow DevKit run that
      // sleeps between touches and survives redeploys. Failure to enqueue is
      // logged, never surfaced: the quote already went out.
      try {
        await start(leadFollowUp, [lead, quote.recommendedPlan.name]);
        routed.push('Follow-up cadence scheduled (day 2 + day 6)');
      } catch (err) {
        log('warn', 'phx-growth/lead', 'follow-up workflow start failed', { err: err instanceof Error ? err.message : String(err) });
      }
    } catch (err) {
      log('warn', 'phx-growth/lead', 'quote email failed', { err: err instanceof Error ? err.message : String(err) });
    }
  }

  // 3 · Zapier Catch Hook — optional fan-out to Slack / Gmail / Sheets.
  const hook = process.env.PHX_GROWTH_LEAD_HOOK_URL;
  if (hook) {
    routed.push('Slack #leads', 'Auto-reply');
    try {
      const res = await fetchWithTimeout(hook, {
        timeoutMs: 10_000,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });
      return ok(
        { configured: true, delivered: res.ok, status: res.status, hubspot, quoted, routed, lead },
        g.rid
      );
    } catch (err) {
      // Never lose a lead on a hook failure.
      return ok(
        {
          configured: true,
          delivered: false,
          note: err instanceof Error ? err.message : 'hook failed; lead captured',
          hubspot,
          quoted,
          routed,
          lead,
        },
        g.rid
      );
    }
  }

  return ok({ configured: Boolean(hubspot) || Boolean(quoted), hubspot, quoted, routed, lead }, g.rid);
}

export async function GET() {
  return ok(
    {
      tool: 'phx-growth-lead-intake',
      method: 'POST',
      body: ['name', 'email', 'company?', 'website?', 'goal?', 'monthlySpend?', 'details?'],
      routes: {
        hubspot: hubspotConfigured() ? 'configured' : 'set HUBSPOT_CLIENT_ID/SECRET + HUBSPOT_DEFAULT_PORTAL_ID',
        quote: emailConfigured() ? 'configured' : 'set RESEND_API_KEY (+ PHX_GROWTH_FROM_EMAIL, PHX_GROWTH_OWNER_EMAIL)',
        zapier: process.env.PHX_GROWTH_LEAD_HOOK_URL ? 'configured' : 'set PHX_GROWTH_LEAD_HOOK_URL',
      },
    },
    'lead-info'
  );
}
