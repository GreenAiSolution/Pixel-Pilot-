// ─── PIXEL PILOT · PERSONALIZED QUOTE ────────────────────────────────────────
// Turns a captured lead into a personalized reply with a real price. The Claude
// engine reads the lead's goal, spend and details against the actual pricing
// catalog (pricing.ts) and drafts the recommendation; Resend delivers it. Both
// hops are optional and non-blocking, matching the rest of the lead fan-out:
// no AI key → a catalog-driven template quote; no Resend key → nothing sends
// and the route reports what *would* have gone out. A lead is never lost or
// blocked by either.
//
// Env: RESEND_API_KEY            (Vercel Marketplace → Resend)
//      PIXEL_PILOT_FROM_EMAIL    optional — verified sender, e.g. "Pixel Pilot <hello@yourdomain.com>"
//      PIXEL_PILOT_OWNER_EMAIL   optional — where the internal lead alert goes

import { askClaudeJSON, aiConfigured } from './ai';
import { fetchWithTimeout } from './http';
import { TIERS, SERVICE_PRICING } from './pricing';

const RESEND_URL = 'https://api.resend.com/emails';

/** Resolve the Resend key under the common env names an integration may use. */
function resendKey(): string | undefined {
  return process.env.RESEND_API_KEY || process.env.RESEND_TOKEN;
}

/** True when the email leg is wired and live. */
export function emailConfigured(): boolean {
  return Boolean(resendKey());
}

export interface LeadInput {
  readonly name: string;
  readonly email: string;
  readonly company?: string;
  readonly website?: string;
  readonly goal?: string;
  readonly monthlySpend?: string;
  readonly details?: string;
}

export interface Quote {
  readonly subject: string;
  /** Short plain-text paragraphs, in order. No markdown, no HTML. */
  readonly paragraphs: string[];
  readonly recommendedPlan: { name: string; price: string; why: string };
  /** Optional à-la-carte add-ons pulled from the real catalog. */
  readonly addOns: { name: string; price: string }[];
}

// The catalog rendered once for the drafting prompt — real names, real prices.
const CATALOG = [
  'MANAGED PLANS (monthly retainer + performance):',
  ...TIERS.map((t) => `- ${t.name}: $${t.price.toLocaleString()}/mo ${t.performance} — ${t.tagline}. For: ${t.forWho}. ${t.adSpend}.`),
  'À LA CARTE (one-time, done for you):',
  ...SERVICE_PRICING.map((s) => `- ${s.name}: ${s.price} ${s.unit} — ${s.tagline}`),
].join('\n');

/** Pick a sensible tier from the stated spend — the no-AI fallback heuristic. */
function tierFromSpend(monthlySpend?: string): (typeof TIERS)[number] {
  const n = Number((monthlySpend ?? '').replace(/[^0-9.]/g, ''));
  if (n >= 150_000) return TIERS[2] ?? TIERS[0];
  if (n >= 50_000) return TIERS[1] ?? TIERS[0];
  return TIERS[0];
}

// Every quotable item with its canonical display price — the only prices an
// email may ever carry, no matter what the model (or a prompt-injecting lead)
// says. Keyed by lowercased name for the post-draft check.
const PRICE_BOOK = new Map<string, { name: string; price: string }>([
  ...TIERS.map((t): [string, { name: string; price: string }] => [
    t.name.toLowerCase(),
    { name: t.name, price: `$${t.price.toLocaleString()}/mo ${t.performance}` },
  ]),
  ...SERVICE_PRICING.map((s): [string, { name: string; price: string }] => [
    s.name.toLowerCase(),
    { name: s.name, price: `${s.price} ${s.unit}` },
  ]),
]);

/**
 * Validate an AI draft against the catalog. The plan must name a real tier or
 * service and its price is FORCED from the price book — model output (which a
 * lead can influence via the form) is never trusted for money. Throws when the
 * shape or plan is wrong so the caller falls back to the template.
 */
function normalizeQuote(q: Quote): Quote {
  if (!Array.isArray(q.paragraphs) || q.paragraphs.length === 0 || !q.paragraphs.every((p) => typeof p === 'string')) {
    throw new Error('quote draft: bad paragraphs shape');
  }
  const plan = PRICE_BOOK.get(String(q.recommendedPlan?.name ?? '').toLowerCase());
  if (!plan) throw new Error('quote draft: plan not in catalog');
  const addOns = (Array.isArray(q.addOns) ? q.addOns : [])
    .map((a) => PRICE_BOOK.get(String(a?.name ?? '').toLowerCase()))
    .filter((a): a is { name: string; price: string } => Boolean(a))
    .slice(0, 2);
  return {
    subject: typeof q.subject === 'string' && q.subject.trim() ? q.subject : 'Your Pixel Pilot flight plan and price',
    paragraphs: q.paragraphs,
    recommendedPlan: { name: plan.name, price: plan.price, why: String(q.recommendedPlan.why ?? '') },
    addOns,
  };
}

/**
 * Draft the personalized quote. Uses the Claude engine when keyed; otherwise
 * falls back to an honest catalog-driven template so the email still carries
 * a real recommendation and price.
 */
export async function draftQuote(lead: LeadInput): Promise<Quote> {
  if (aiConfigured()) {
    try {
      return normalizeQuote(await askClaudeJSON<Quote>({
        system:
          'You are Pixel Pilot, an autonomous AI media buyer, replying to a new inbound lead. ' +
          'Write a short, personal, plain-English reply that addresses THEIR stated goal and situation, ' +
          'then recommend exactly one plan or service from the catalog below with its real price. ' +
          'Voice: confident, concrete, aviation-flavored, zero hype. HARD RULES: prices must come ' +
          'verbatim from the catalog; never promise results, ROAS, or income; never invent case studies; ' +
          '3-5 short paragraphs; sign off as "Pixel Pilot Flight Command".\n\nCATALOG:\n' + CATALOG +
          '\n\nReturn JSON: {"subject": string, "paragraphs": string[], ' +
          '"recommendedPlan": {"name": string, "price": string, "why": string}, ' +
          '"addOns": [{"name": string, "price": string}]} — addOns may be empty, max 2.',
        prompt: JSON.stringify(lead),
        maxTokens: 1200,
      }));
    } catch {
      // fall through to the template — a slow, failed, or off-catalog draft
      // must not cost the reply
    }
  }
  const tier = tierFromSpend(lead.monthlySpend);
  const first = lead.name.trim().split(/\s+/)[0] || 'there';
  return {
    subject: `${first} — your Pixel Pilot flight plan and price`,
    paragraphs: [
      `Hi ${first}, thanks for reaching out${lead.company ? ` about ${lead.company}` : ''}. Your goal — ${lead.goal || 'more customers'} — is exactly what Pixel Pilot is built to fly.`,
      `Based on what you shared${lead.monthlySpend ? ` (around ${lead.monthlySpend}/mo in ad spend)` : ''}, the right fit is our ${tier.name} plan: $${tier.price.toLocaleString()}/mo ${tier.performance}. ${tier.tagline} — ${tier.adSpend.toLowerCase()}.`,
      'Every decision steers by your real profit, not the ad platform grading its own homework — and creative is pre-tested on synthetic buyers before a dollar of your budget moves.',
      'Reply to this email or book a call and we can have you live in under an hour.',
      '— Pixel Pilot Flight Command',
    ],
    recommendedPlan: { name: tier.name, price: `$${tier.price.toLocaleString()}/mo ${tier.performance}`, why: tier.forWho },
    addOns: [],
  };
}

/** Minimal branded HTML around the drafted paragraphs. */
function renderHtml(q: Quote): string {
  const paras = q.paragraphs.map((p) => `<p style="margin:0 0 14px;line-height:1.6">${escapeHtml(p)}</p>`).join('');
  const addOns = q.addOns.length
    ? `<p style="margin:14px 0 0;font-size:13px;color:#555">Add-ons to consider: ${q.addOns.map((a) => `${escapeHtml(a.name)} (${escapeHtml(a.price)})`).join(' · ')}</p>`
    : '';
  return (
    `<div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:28px 20px;color:#111">` +
    `<div style="font-size:13px;letter-spacing:.2em;text-transform:uppercase;background:linear-gradient(90deg,#00D4FF,#6C63FF,#FF2E9A);-webkit-background-clip:text;background-clip:text;color:transparent;font-weight:600;margin-bottom:20px">Pixel/Pilot</div>` +
    paras +
    `<div style="margin:18px 0;padding:14px 16px;border:1px solid #e5e5e5;border-radius:12px">` +
    `<div style="font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:#888">Recommended</div>` +
    `<div style="font-size:16px;font-weight:600;margin-top:4px">${escapeHtml(q.recommendedPlan.name)} — ${escapeHtml(q.recommendedPlan.price)}</div>` +
    `<div style="font-size:13px;color:#555;margin-top:4px">${escapeHtml(q.recommendedPlan.why)}</div>` +
    `</div>` +
    addOns +
    `</div>`
  );
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Send one email via the Resend REST API. Throws on non-2xx. */
async function sendEmail(to: string, subject: string, html: string, replyTo?: string): Promise<string> {
  const key = resendKey();
  if (!key) throw new Error('RESEND_API_KEY is not set');
  const from = process.env.PIXEL_PILOT_FROM_EMAIL || 'Pixel Pilot <onboarding@resend.dev>';
  const res = await fetchWithTimeout(RESEND_URL, {
    timeoutMs: 10_000,
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as { id?: string };
  return data.id ?? 'sent';
}

/** The lead-facing quote email. Returns the Resend message id. */
export async function sendQuoteEmail(lead: LeadInput, quote: Quote): Promise<string> {
  return sendEmail(lead.email, quote.subject, renderHtml(quote), process.env.PIXEL_PILOT_OWNER_EMAIL);
}

/**
 * Deterministic follow-up touches for the durable lead cadence
 * (workflows/lead-follow-up.ts). No AI hop — the quote already carried the
 * personalization; follow-ups just need to be short, honest, and on time.
 * Prices are resolved from the price book, never carried in workflow state.
 */
export function draftFollowUp(lead: LeadInput, planName: string, touch: 1 | 2): Quote {
  const first = lead.name.trim().split(/\s+/)[0] || 'there';
  const plan = PRICE_BOOK.get(planName.toLowerCase()) ?? (() => {
    const t = tierFromSpend(lead.monthlySpend);
    return { name: t.name, price: `$${t.price.toLocaleString()}/mo ${t.performance}` };
  })();
  const paragraphs =
    touch === 1
      ? [
          `Hi ${first} — a couple of days ago we sent over a flight plan for ${lead.goal || 'more customers'}${lead.company ? ` at ${lead.company}` : ''}, and wanted to make sure it landed.`,
          `The recommendation stands: ${plan.name} at ${plan.price}. Setup takes under an hour, and every decision steers by your real profit — not the ad platforms grading their own homework.`,
          'Any questions about the plan or the price, just reply — a real person reads these.',
          '— Pixel Pilot Flight Command',
        ]
      : [
          `Hi ${first} — last check-in from us, promised.`,
          `Your quote for ${plan.name} (${plan.price}) is still good whenever the timing is right. No pressure and no expiry games — reply any time and we pick up where we left off.`,
          'Wishing you full boards and cheap clicks either way.',
          '— Pixel Pilot Flight Command',
        ];
  return {
    subject:
      touch === 1
        ? `${first} — did your Pixel Pilot flight plan land?`
        : `${first} — leaving the runway lights on`,
    paragraphs,
    recommendedPlan: { name: plan.name, price: plan.price, why: '' },
    addOns: [],
  };
}

/** Send one follow-up touch to the lead. Returns the Resend message id. */
export async function sendFollowUpEmail(lead: LeadInput, planName: string, touch: 1 | 2): Promise<string> {
  const q = draftFollowUp(lead, planName, touch);
  return sendEmail(lead.email, q.subject, renderHtml(q), process.env.PIXEL_PILOT_OWNER_EMAIL);
}

/** The internal "new lead + what we quoted" alert. No-op without an owner email. */
export async function sendOwnerAlert(lead: LeadInput, quote: Quote): Promise<string | null> {
  const owner = process.env.PIXEL_PILOT_OWNER_EMAIL;
  if (!owner) return null;
  const rows = Object.entries({
    Name: lead.name, Email: lead.email, Company: lead.company, Website: lead.website,
    Goal: lead.goal, 'Monthly spend': lead.monthlySpend, Details: lead.details,
  })
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#888;font-size:13px">${k}</td><td style="padding:4px 0;font-size:13px">${escapeHtml(String(v))}</td></tr>`)
    .join('');
  const html =
    `<div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:24px 20px;color:#111">` +
    `<h2 style="margin:0 0 12px;font-size:16px">New lead — quoted ${escapeHtml(quote.recommendedPlan.name)} at ${escapeHtml(quote.recommendedPlan.price)}</h2>` +
    `<table style="border-collapse:collapse">${rows}</table>` +
    `<p style="margin:16px 0 0;font-size:12px;color:#888">The personalized quote was auto-sent to the lead. Reply-to points at you.</p>` +
    `</div>`;
  return sendEmail(owner, `Lead: ${lead.name}${lead.company ? ` (${lead.company})` : ''} — quoted ${quote.recommendedPlan.name}`, html);
}
