// ─── PIXEL PILOT · TOOL · WEBSITE CREATION & DEVELOPMENT ─────────────────────
// POST /api/pixel-pilot/tools/website
// Body: { business, goal?, style?, sections? }
// Workflow: plan the sitemap, write the copy, and generate a complete, responsive
// single-page site (deploy-ready HTML). Live with ANTHROPIC_API_KEY; preview
// otherwise (returns a real, valid HTML scaffold — no gap).

import { NextRequest, NextResponse } from 'next/server';
import { askClaudeJSON, aiConfigured, AINotConfiguredError } from '@/pixel-pilot/ai';
import { pushToList } from '@/pixel-pilot/store';

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

export async function POST(req: NextRequest) {
  const input = (await req.json().catch(() => ({}))) as SiteInput;
  const business = input.business?.trim() || 'a modern business';

  const system =
    'You are Pixel Pilot, a senior conversion-focused web designer and front-end engineer. You produce clean, responsive, accessible single-page sites as self-contained HTML (inline CSS, no external assets), built to convert.';
  const prompt =
    `Create a landing page for: ${business}.\n` +
    `Goal: ${input.goal || 'drive sign-ups / sales'}. Style: ${input.style || 'premium, modern, trustworthy'}.\n` +
    `Sections: ${(input.sections && input.sections.length ? input.sections : ['hero', 'features', 'social proof', 'pricing', 'CTA']).join(', ')}.\n` +
    `Return JSON: { sitemap: string[] (section anchors), headline: string, html: string }.\n` +
    `The html must be a COMPLETE, valid, responsive single-page document (<!doctype html> … </html>) with inline <style>, mobile-first, and a clear primary CTA. No external fonts/scripts/images (use CSS gradients + system fonts).`;

  try {
    const result = await askClaudeJSON<SiteResult>({ system, prompt, maxTokens: 8000 });
    await pushToList('pp:tools:website', { at: new Date().toISOString(), business, sitemap: result.sitemap, bytes: result.html?.length ?? 0 });
    return NextResponse.json({ ok: true, live: true, result });
  } catch (err) {
    if (err instanceof AINotConfiguredError) {
      return NextResponse.json({
        ok: true,
        live: false,
        note: 'Preview — add ANTHROPIC_API_KEY to generate a full custom site.',
        result: previewSite(business),
      });
    }
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'failed' }, { status: 502 });
  }
}

export async function GET() {
  return NextResponse.json({ tool: 'website-dev', live: aiConfigured(), method: 'POST', body: ['business', 'goal?', 'style?', 'sections?'] });
}

function previewSite(business: string): SiteResult {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${business}</title><style>*{box-sizing:border-box;margin:0}body{font-family:system-ui,sans-serif;background:#05060f;color:#fff;line-height:1.6}.wrap{max-width:960px;margin:0 auto;padding:0 24px}.hero{min-height:70vh;display:flex;flex-direction:column;justify-content:center;text-align:center;gap:20px}h1{font-size:clamp(2rem,7vw,4rem);background:linear-gradient(90deg,#00D4FF,#6C63FF,#FF2E9A);-webkit-background-clip:text;background-clip:text;color:transparent}p{color:#8890A0;font-size:1.2rem;max-width:36rem;margin:0 auto}.cta{display:inline-block;margin-top:16px;padding:14px 28px;border-radius:999px;background:linear-gradient(90deg,#6C63FF,#FF2E9A);color:#fff;text-decoration:none;font-weight:600}section{padding:64px 0;border-top:1px solid rgba(255,255,255,.08)}</style></head><body><div class="wrap"><div class="hero"><h1>${business}</h1><p>The premium way to get results — built to convert, ready to launch.</p><a class="cta" href="#cta">Get started →</a></div><section id="features"><h2>Why choose us</h2><p>Fast, trustworthy, and designed to sell.</p></section><section id="cta"><h2>Ready to launch?</h2><p>Start today.</p><a class="cta" href="#">Book a call →</a></section></div></body></html>`;
  return { sitemap: ['hero', 'features', 'cta'], headline: `${business} — built to convert`, html };
}
