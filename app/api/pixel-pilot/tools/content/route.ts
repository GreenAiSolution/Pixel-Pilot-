// ─── PIXEL PILOT · TOOL · CONTENT ENGINE ─────────────────────────────────────
// POST /api/pixel-pilot/tools/content
// Body: { business, platform?, goal?, days?, tone? }
// Workflow: a ready-to-post content calendar — hook, caption, format and CTA per
// day, plus a hashtag set. Live with ANTHROPIC_API_KEY; preview otherwise.

import { NextRequest, NextResponse } from 'next/server';
import { askClaudeJSON, aiConfigured, AINotConfiguredError } from '@/pixel-pilot/ai';
import { pushToList } from '@/pixel-pilot/store';

export const maxDuration = 60;

interface ContentInput {
  business?: string;
  platform?: string;
  goal?: string;
  days?: number;
  tone?: string;
}
interface Post {
  day: string;
  format: string;
  hook: string;
  caption: string;
  cta: string;
}
interface ContentResult {
  theme: string;
  calendar: Post[];
  hashtags: string[];
}

export async function POST(req: NextRequest) {
  const input = (await req.json().catch(() => ({}))) as ContentInput;
  const business = input.business?.trim() || 'a modern business';
  const platform = input.platform?.trim() || 'Instagram';
  const days = Math.max(3, Math.min(14, Number(input.days) || 7));

  const system =
    'You are Pixel Pilot, an elite social content strategist. You write platform-native, scroll-stopping content calendars that build an audience and drive action — not generic filler.';
  const prompt =
    `Build a ${days}-day ${platform} content calendar for: ${business}.\n` +
    `Goal: ${input.goal || 'grow the audience and drive sales'}. Tone: ${input.tone || 'confident and premium'}.\n` +
    `Return JSON: {\n` +
    `  theme: string (the through-line for the ${days} days),\n` +
    `  calendar: [{day (e.g. "Day 1 · Mon"), format (Reel/Carousel/Story/Static/Live), hook (scroll-stopping first line), caption (40-70 words), cta (short)}],\n` +
    `  hashtags: string[] (10-14 mixed reach tags, no # symbol)\n} — exactly ${days} calendar entries.`;

  try {
    const result = await askClaudeJSON<ContentResult>({ system, prompt, maxTokens: 3000 });
    await pushToList('pp:tools:content', { at: new Date().toISOString(), business, platform, days });
    return NextResponse.json({ ok: true, live: true, result });
  } catch (err) {
    if (err instanceof AINotConfiguredError) {
      return NextResponse.json({ ok: true, live: false, note: 'Preview — add ANTHROPIC_API_KEY for a full custom calendar.', result: previewContent(business, platform, days) });
    }
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'failed' }, { status: 502 });
  }
}

export async function GET() {
  return NextResponse.json({ tool: 'content-engine', live: aiConfigured(), method: 'POST', body: ['business', 'platform?', 'goal?', 'days?', 'tone?'] });
}

function previewContent(business: string, platform: string, days: number): ContentResult {
  const formats = ['Reel', 'Carousel', 'Story', 'Static', 'Live'];
  const calendar: Post[] = Array.from({ length: days }, (_, i) => ({
    day: `Day ${i + 1}`,
    format: formats[i % formats.length],
    hook: `The one thing nobody tells you about ${business}.`,
    caption: `A sharp, on-brand ${platform} post for ${business}. Enable the AI engine to generate a fully custom caption tuned to your goal, tone and audience.`,
    cta: 'Save this →',
  }));
  return {
    theme: `A ${days}-day arc that builds trust and drives action for ${business}.`,
    calendar,
    hashtags: ['marketing', 'growth', 'smallbusiness', 'branding', 'contentstrategy', 'entrepreneur', 'dtc', 'ecommerce', 'ai', 'startup'],
  };
}
