// ─── PIXEL PILOT · TOOL · ZERO-TO-LIVE LAUNCH PLANNER ────────────────────────
// POST /api/pixel-pilot/tools/launch-plan
// Body: { url?, product?, budget? }
// Workflow: research → personas → channel + budget plan → creative concepts →
// tracking checklist. Live with ANTHROPIC_API_KEY; structured preview otherwise.

import { NextRequest, NextResponse } from 'next/server';
import { askClaudeJSON, aiConfigured, AINotConfiguredError } from '@/pixel-pilot/ai';
import { guard } from '@/pixel-pilot/api';
import { pushToList } from '@/pixel-pilot/store';

export const maxDuration = 60;

interface PlanInput {
  url?: string;
  product?: string;
  budget?: string;
}
interface ChannelSplit {
  channel: string;
  percent: number;
  why: string;
}
interface LaunchPlan {
  research: string[];
  personas: string[];
  channelPlan: ChannelSplit[];
  creativeConcepts: string[];
  trackingChecklist: string[];
}

export async function POST(req: NextRequest) {
  const g = await guard(req, {
    source: 'tools/launch-plan', bucket: 'tools', limit: 20, windowSec: 60,
    schema: { url: { type: 'string', maxLen: 500 }, product: { type: 'string', maxLen: 400 }, budget: { type: 'string', maxLen: 80 } },
  });
  if (!g.ok) return g.response;
  const input = g.body as PlanInput;
  const subject = input.url?.trim() || input.product?.trim() || 'the product';
  const budget = input.budget?.trim() || '$10k/mo';

  const system =
    'You are Pixel Pilot, an autonomous media buyer. Turn a product or URL into a complete, defensible go-to-live plan optimizing to profit, not ROAS. No guaranteed-returns language.';
  const prompt =
    `Build a zero-to-live launch plan for: ${subject}. Monthly budget: ${budget}.\n` +
    `Return JSON: {\n` +
    `  research: string[] (4-6 market/competitor findings),\n` +
    `  personas: string[] (3 synthetic buyer personas),\n` +
    `  channelPlan: [{channel, percent (int, sums to 100), why}] across Meta, Google, TikTok,\n` +
    `  creativeConcepts: string[] (4 first-ad concepts),\n` +
    `  trackingChecklist: string[] (pixels, CAPI, profit ground-truth)\n}`;

  try {
    const result = await askClaudeJSON<LaunchPlan>({ system, prompt, maxTokens: 3000 });
    await pushToList('pp:tools:launch-plan', { at: new Date().toISOString(), subject, budget });
    return NextResponse.json({ ok: true, live: true, result });
  } catch (err) {
    if (err instanceof AINotConfiguredError) {
      return NextResponse.json({ ok: true, live: false, note: 'Preview — add ANTHROPIC_API_KEY for a fully-researched plan.', result: previewPlan(subject) });
    }
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'failed' }, { status: 502 });
  }
}

export async function GET() {
  return NextResponse.json({ tool: 'zero-to-live', live: aiConfigured(), method: 'POST', body: ['url?', 'product?', 'budget?'] });
}

function previewPlan(subject: string): LaunchPlan {
  return {
    research: [
      `Map the market and top competitors around ${subject}`,
      'Identify the sharpest wedge vs. incumbents',
      'Read the post-iOS attribution landscape for the niche',
      'Pull believable, defensible proof points',
    ],
    personas: ['The value-driven founder', 'The skeptical performance buyer', 'The time-poor operator'],
    channelPlan: [
      { channel: 'Meta', percent: 50, why: 'Demand engine + best creative testing surface' },
      { channel: 'Google', percent: 30, why: 'Captures high-intent search + PMax' },
      { channel: 'TikTok', percent: 20, why: 'Velocity channel for fresh creative' },
    ],
    creativeConcepts: [
      'Myth-buster: "your dashboard is lying"',
      'Demo: zero-to-live in under 60 minutes',
      'Founder POV: profit, not ROAS',
      'Before/after: wasted spend → profit curve',
    ],
    trackingChecklist: ['Meta Pixel + CAPI', 'Google conversion + Enhanced Conversions', 'TikTok Pixel + Events API', 'Shopify margin as ground truth'],
  };
}
