// ─── PIXEL PILOT · LEAD FOLLOW-UP WORKFLOW ───────────────────────────────────
// The durable cadence behind lead intake, built on the Vercel Workflow DevKit
// ("use workflow" / "use step"). Started by /api/pixel-pilot/lead right after
// the personalized quote goes out, then it runs unattended:
//
//   quote sent ──▶ sleep 2d ──▶ touch 1 ("did it land?")
//                        └─▶ sleep 4d ──▶ touch 2 (last check-in)
//
// Sleeps hold no compute and survive redeploys — the run resumes on Vercel
// exactly where it left off. Before every touch the workflow re-checks reality:
// if the lead became a CRM client, or the owner set the stop key
// (`pp:followup:stop:<email>`), the cadence ends quietly. Every touch is
// appended to `pp:followups` so the deck can show what went out.

import { sleep, FatalError } from 'workflow';
import { sendFollowUpEmail, emailConfigured, type LeadInput } from '@/pixel-pilot/quote';
import { get, pushToList } from '@/pixel-pilot/store';
import { listClients } from '@/pixel-pilot/crm';

export async function leadFollowUp(lead: LeadInput, quotedPlan: string) {
  'use workflow';

  await sleep('2d');
  if (await followUpStopped(lead.email)) return { status: 'stopped', touchesSent: 0 };
  await sendTouch(lead, quotedPlan, 1);

  await sleep('4d');
  if (await followUpStopped(lead.email)) return { status: 'stopped', touchesSent: 1 };
  await sendTouch(lead, quotedPlan, 2);

  return { status: 'complete', touchesSent: 2 };
}

/**
 * True when the cadence should end: the lead converted into a CRM client, or
 * someone flipped the per-lead stop key. Checked fresh before every touch —
 * never trusted from workflow state, which could be days old.
 */
async function followUpStopped(email: string): Promise<boolean> {
  'use step';
  const needle = email.trim().toLowerCase();
  if (await get<boolean>(`pp:followup:stop:${needle}`)) return true;
  const clients = await listClients();
  return clients.some((c) => (c.email ?? '').trim().toLowerCase() === needle);
}

/** Send one follow-up touch and log it to the flight record. Retried by the runtime on failure. */
async function sendTouch(lead: LeadInput, quotedPlan: string, touch: 1 | 2): Promise<string> {
  'use step';
  // Keys can be pulled between intake and a touch — that's a config state, not
  // a transient fault, so don't burn retries on it.
  if (!emailConfigured()) throw new FatalError('RESEND_API_KEY unset at send time');
  const messageId = await sendFollowUpEmail(lead, quotedPlan, touch);
  await pushToList('pp:followups', {
    sentAt: new Date().toISOString(),
    email: lead.email,
    name: lead.name,
    quotedPlan,
    touch,
    messageId,
  }).catch(() => {});
  return messageId;
}
