// ─── PIXEL PILOT · TOOL · WEBSITE CREATION & DEVELOPMENT ─────────────────────
// POST /api/pixel-pilot/tools/website
// Body: { business, goal?, style?, sections? }
// Workflow: plan the sitemap, write the copy, generate a complete responsive
// single-page site (deploy-ready HTML) — and AUTO-DEPLOY it to a live URL on
// this domain (/sites/<id>), served by app/sites/[slug]/route.ts. Live with
// ANTHROPIC_API_KEY; preview otherwise (still deploys the scaffold — no gap).

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { askClaudeJSON, aiConfigured, AINotConfiguredError } from '@/pixel-pilot/ai';
import { guard } from '@/pixel-pilot/api';
import { pushToList, set, storeIsDurable } from '@/pixel-pilot/store';

export const maxDuration = 60;

interface SiteInput {
  business?: string;
  goal?: string;
  style?: string;
  sections?: string[];
}
interface SiteResult {
  sitemap: string[];
  headline: string;
  html: string;
}
export interface DeployedSite {
  slug: string;
  html: string;
  business: string;
  deployedAt: string;
}

/** Persist the generated HTML and return its live URL. */
async function deploy(req: NextRequest, html: string, business: string): Promise<{ slug: string; url: string; durable: boolean }> {
  const slug = crypto.randomBytes(5).toString('hex');
  const record: DeployedSite = { slug, html, business, deployedAt: new Date().toISOString() };
  await set(`pp:site:${slug}`, record);
  const origin = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  return { slug, url: `${origin}/sites/${slug}`, durable: storeIsDurable() };
}

export async function POST(req: NextRequest) {
  const g = await guard(req, {
    source: 'tools/website', bucket: 'tools', limit: 20, windowSec: 60,
    schema: { business: { type: 'string', required: true, maxLen: 400 }, goal: { type: 'string', maxLen: 200 }, style: { type: 'string', maxLen: 120 }, sections: { type: 'array', maxLen: 40 } },
  });
  if (!g.ok) return g.response;
  const input = g.body as SiteInput;
  const business = input.business?.trim() || 'a modern business';

  const system =
    'You are Pixel Pilot, a senior conversion-focused web designer and front-end engineer. You produce clean, responsive, accessible single-page sites as self-contained HTML (inline CSS, no external assets), built to convert.';
  const prompt =
    `Create a landing page for: ${business}.\n` +
    `Goal: ${input.goal || 'drive sign-ups / sales'}. Style: ${input.style || 'premium, modern, trustworthy'}.\n` +
    `Sections: ${(input.sections && input.sections.length ? input.sections : ['hero', 'features', 'social proof', 'pricing', 'CTA']).join(', ')}.\n` +
    `Return JSON: { sitemap: string[] (section anchors), headline: string, html: string }.\n` +
    `The html must be a COMPLETE, valid, responsive single-page document (<!doctype html> … </html>) with inline <style>, mobile-first, and a clear primary CTA. No external fonts/scripts/images (use CSS gradients + system fonts).`;

  let result: SiteResult;
  let live = true;
  try {
    result = await askClaudeJSON<SiteResult>({ system, prompt, maxTokens: 5000 });
  } catch (err) {
    if (!(err instanceof AINotConfiguredError)) {
      return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'failed' }, { status: 502 });
    }
    live = false;
    result = previewSite(business);
  }

  const deployed = await deploy(req, result.html, business);
  await pushToList('pp:tools:website', { at: new Date().toISOString(), business, slug: deployed.slug, bytes: result.html?.length ?? 0, live });

  return NextResponse.json({
    ok: true,
    live,
    ...(live ? {} : { note: 'Preview — add ANTHROPIC_API_KEY to generate a full custom site.' }),
    ...(deployed.durable ? {} : { deployNote: 'Deployed to an in-memory host — add KV_REST_API_URL/TOKEN for a permanent site.' }),
    result,
    deployed: { slug: deployed.slug, url: deployed.url },
  });
}

export async function GET() {
  return NextResponse.json({ tool: 'website-dev', live: aiConfigured(), method: 'POST', body: ['business', 'goal?', 'style?', 'sections?'] });
}

function previewSite(business: string): SiteResult {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${business}</title><style>*{box-sizing:border-box;margin:0}body{font-family:system-ui,sans-serif;background:#05060f;color:#fff;line-height:1.6}.wrap{max-width:960px;margin:0 auto;padding:0 24px}.hero{min-height:70vh;display:flex;flex-direction:column;justify-content:center;text-align:center;gap:20px}h1{font-size:clamp(2rem,7vw,4rem);background:linear-gradient(90deg,#00D4FF,#6C63FF,#FF2E9A);-webkit-background-clip:text;background-clip:text;color:transparent}p{color:#8890A0;font-size:1.2rem;max-width:36rem;margin:0 auto}.cta{display:inline-block;margin-top:16px;padding:14px 28px;border-radius:999px;background:linear-gradient(90deg,#6C63FF,#FF2E9A);color:#fff;text-decoration:none;font-weight:600}section{padding:64px 0;border-top:1px solid rgba(255,255,255,.08)}</style></head><body><div class="wrap"><div class="hero"><h1>${business}</h1><p>The premium way to get results — built to convert, ready to launch.</p><a class="cta" href="#cta">Get started →</a></div><section id="features"><h2>Why choose us</h2><p>Fast, trustworthy, and designed to sell.</p></section><section id="cta"><h2>Ready to launch?</h2><p>Start today.</p><a class="cta" href="#">Book a call →</a></section></div></body></html>`;
  return { sitemap: ['hero', 'features', 'cta'], headline: `${business} — built to convert`, html };
}
