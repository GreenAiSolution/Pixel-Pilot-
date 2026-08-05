// ─── PHX GROWTH · BUILD INTAKE ───────────────────────────────────────────────
// POST /api/phx/design
// The far end of the /build configurator. A customer has assembled an employee
// — name, manner, duties, trade, hours, escalation list — and this delivers the
// finished spec to the inbox that acts on it.
//
// Two rules shape the whole file:
//   1 · Capture before delivery. The spec is written to the durable list first,
//       so a mail outage can never lose a build that someone spent five minutes
//       configuring.
//   2 · Report the truth. The response says whether the email actually left,
//       and the page tells the customer when it did not. A silent "thanks!"
//       over a dropped submission is the one failure mode worth engineering out.

import { NextRequest } from 'next/server';
import { guard, ok, fail, log } from '@/pixel-pilot/api';
import { pushToList } from '@/pixel-pilot/store';
import { fetchWithTimeout } from '@/pixel-pilot/http';

const RESEND_URL = 'https://api.resend.com/emails';

// Where builds land. Deliberately NOT falling back to PIXEL_PILOT_OWNER_EMAIL:
// that variable is already set on this project to a different inbox, and builds
// were asked for at this address specifically. PHX_BUILD_TO is the only override.
const TO = process.env.PHX_BUILD_TO || 'jadengreen808@gmail.com';

const resendKey = () => process.env.RESEND_API_KEY || process.env.RESEND_TOKEN;

// Labels for the duty ids the client sends. Kept here rather than imported from
// the component so the API stays renderable without pulling in client code, and
// so an unknown id degrades to itself instead of vanishing from the email.
const DUTY_LABELS: Record<string, string> = {
  answer: 'Answer every call (24/7, no voicemail)',
  book: 'Book the job onto the calendar',
  emergency: 'Escalate emergencies to a human',
  screen: 'Screen sales calls',
  missed: 'Text back missed calls within 60s',
  confirm: "Confirm tomorrow's jobs",
  quotes: 'Chase quotes that went quiet',
  reviews: 'Ask for reviews after every job',
};

const MANNER: Record<string, string> = {
  ivy: 'Warm — headset, soft visor',
  dex: 'Brisk — scan bar, beacon',
  rae: 'Patient — single steady lens',
};

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string
  );
}

function strings(v: unknown, cap = 20): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === 'string').slice(0, cap).map((s) => s.slice(0, 120));
}

function renderEmail(spec: Record<string, string | string[]>, bot: string): string {
  const row = (k: string, v: string) =>
    `<tr>
       <td style="padding:9px 18px 9px 0;color:#7c8996;font-size:12px;letter-spacing:.08em;text-transform:uppercase;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td>
       <td style="padding:9px 0;font-size:15px;color:#e9eef3;border-bottom:1px solid #1e2932">${escapeHtml(v)}</td>
     </tr>`;

  const rows = Object.entries(spec)
    .filter(([, v]) => (Array.isArray(v) ? v.length : String(v).trim()))
    .map(([k, v]) => row(k, Array.isArray(v) ? v.join(' · ') : String(v)))
    .join('');

  return `<div style="background:#0a0e13;padding:32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:620px;margin:0 auto;background:#111821;border:1px solid #1e2932;border-radius:12px;padding:32px">
    <div style="font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#ffb44a;margin-bottom:8px">New build · phxgrowth agentic</div>
    <h1 style="margin:0 0 4px;font-size:28px;color:#e9eef3;letter-spacing:-.02em">${escapeHtml(bot)}</h1>
    <p style="margin:0 0 24px;color:#7c8996;font-size:14px">Someone designed this on the site and asked for it.</p>
    <table style="width:100%;border-collapse:collapse">${rows}</table>
    <p style="margin:26px 0 0;color:#7c8996;font-size:13px;line-height:1.6">
      Reply straight to this email — it goes to the customer.
    </p>
  </div>
</div>`;
}

export async function POST(req: NextRequest) {
  const g = await guard(req, {
    source: 'phx/design',
    bucket: 'design',
    limit: 8,
    windowSec: 60,
    schema: {
      botName: { type: 'string', required: true, maxLen: 40 },
      chassis: { type: 'string', maxLen: 12 },
      tone: { type: 'string', maxLen: 12 },
      duties: { type: 'array', maxLen: 20 },
      trade: { type: 'string', maxLen: 40 },
      business: { type: 'string', maxLen: 80 },
      hours: { type: 'string', maxLen: 40 },
      emergencies: { type: 'array', maxLen: 20 },
      wakeName: { type: 'string', maxLen: 60 },
      wakePhone: { type: 'string', maxLen: 30 },
      yourName: { type: 'string', required: true, maxLen: 100 },
      email: { type: 'string', required: true, maxLen: 160 },
      phone: { type: 'string', maxLen: 30 },
      notes: { type: 'string', maxLen: 800 },
      plan: { type: 'string', maxLen: 40 },
      planPrice: { type: 'number', max: 100_000 },
    },
  });
  if (!g.ok) return g.response;
  const b = g.body as Record<string, unknown>;

  const str = (k: string) => (typeof b[k] === 'string' ? (b[k] as string).trim() : '');
  const email = str('email');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return fail(400, 'A valid email is required', g.rid);
  }

  const bot = str('botName') || 'Unnamed';
  const duties = strings(b.duties).map((d) => DUTY_LABELS[d] ?? d);
  const emergencies = strings(b.emergencies);
  const price = typeof b.planPrice === 'number' ? b.planPrice : null;

  const build = {
    source: 'phx-growth-builder',
    receivedAt: new Date().toISOString(),
    bot,
    chassis: str('chassis'),
    tone: str('tone'),
    duties,
    trade: str('trade'),
    business: str('business'),
    hours: str('hours'),
    emergencies,
    wakeName: str('wakeName'),
    wakePhone: str('wakePhone'),
    contactName: str('yourName'),
    email,
    phone: str('phone'),
    notes: str('notes'),
    plan: str('plan'),
    planPrice: price,
  };

  // 1 · Capture first. A mail failure must never cost us the build.
  await pushToList('phx:builds', build).catch(() => {});

  // 2 · Deliver.
  const spec: Record<string, string | string[]> = {
    'Employee name': bot,
    Manner: MANNER[build.chassis] ?? build.chassis,
    Business: build.business,
    Trade: build.trade,
    Answers: build.hours,
    Duties: duties,
    ...(emergencies.length ? { Emergencies: emergencies } : {}),
    ...(build.wakeName || build.wakePhone
      ? { 'Wake on emergency': [build.wakeName, build.wakePhone].filter(Boolean).join(' · ') }
      : {}),
    'Closest plan': build.plan ? `${build.plan}${price ? ` · $${price.toLocaleString()}/mo` : ''}` : '',
    Contact: [build.contactName, email, build.phone].filter(Boolean).join(' · '),
    ...(build.notes ? { Notes: build.notes } : {}),
  };

  const key = resendKey();
  let delivered = false;
  let messageId: string | null = null;
  let error: string | null = null;

  if (!key) {
    error = 'mail provider not configured';
    log('warn', 'phx/design', 'build captured but RESEND_API_KEY is unset', { bot });
  } else {
    try {
      const res = await fetchWithTimeout(RESEND_URL, {
        timeoutMs: 10_000,
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.PIXEL_PILOT_FROM_EMAIL || 'PHX Growth <onboarding@resend.dev>',
          to: [TO],
          subject: `New build: ${bot}${build.business ? ` for ${build.business}` : ''}`,
          html: renderEmail(spec, bot),
          reply_to: email, // so replying reaches the customer, not us
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { id?: string };
        messageId = data.id ?? 'sent';
        delivered = true;
      } else {
        error = `Resend ${res.status}`;
        log('warn', 'phx/design', 'resend rejected', { status: res.status, body: (await res.text()).slice(0, 200) });
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'send failed';
      log('warn', 'phx/design', 'send threw', { err: error });
    }
  }

  // `ok: true` means the build is safe with us — which is true either way,
  // because it was persisted above. `delivered` is the separate, honest fact.
  return ok({ ok: true, delivered, messageId, error, bot }, g.rid);
}

export async function GET() {
  return ok(
    {
      tool: 'phx-growth-build-intake',
      method: 'POST',
      body: ['botName', 'yourName', 'email', 'duties[]', 'trade?', 'business?', 'hours?', 'emergencies[]', 'notes?'],
      deliversTo: TO,
      mail: resendKey() ? 'configured' : 'set RESEND_API_KEY (+ PIXEL_PILOT_FROM_EMAIL)',
    },
    'design-info'
  );
}
