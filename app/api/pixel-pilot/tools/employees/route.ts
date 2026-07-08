// ─── PIXEL PILOT · TOOL · AI EMPLOYEES ───────────────────────────────────────
// GET  /api/pixel-pilot/tools/employees   → the roster you can hire
// POST /api/pixel-pilot/tools/employees   → hire a crew + get a deployment plan
// Body: { business, goals?, roster?: string[] (agent ids) }
// Built on the real PIXEL_AGENTS roster; the deployment plan is AI-tailored when
// ANTHROPIC_API_KEY is set, templated otherwise (no gap).

import { NextRequest, NextResponse } from 'next/server';
import { PIXEL_AGENTS, getPixelAgent } from '@/pixel-pilot/agents';
import { askClaudeJSON, aiConfigured, AINotConfiguredError } from '@/pixel-pilot/ai';
import { pushToList } from '@/pixel-pilot/store';

interface HireInput {
  business?: string;
  goals?: string;
  roster?: string[];
}
interface DeploymentPlan {
  cadence: string;
  firstWeek: string[];
  reportsTo: string;
}

export async function GET() {
  return NextResponse.json({
    tool: 'ai-employees',
    live: aiConfigured(),
    roster: PIXEL_AGENTS.map((a) => ({ id: a.id, name: a.name, role: a.role, command: a.command })),
  });
}

export async function POST(req: NextRequest) {
  const input = (await req.json().catch(() => ({}))) as HireInput;
  const business = input.business?.trim() || 'your business';
  const ids = input.roster?.length ? input.roster : PIXEL_AGENTS.map((a) => a.id);
  const hired = ids.map((id) => getPixelAgent(id)).filter(Boolean);

  const system =
    'You are Pixel Pilot, deploying a crew of autonomous AI operators into a business. Produce a crisp, realistic first-week deployment plan. Safe-by-default: agents stage work for approval, never auto-publish.';
  const prompt =
    `Business: ${business}. Goals: ${input.goals || 'grow profitably'}.\n` +
    `Crew being hired: ${hired.map((a) => `${a!.name} (${a!.role})`).join(', ')}.\n` +
    `Return JSON: { cadence: string (e.g. "daily 8:10am"), firstWeek: string[] (5-7 concrete tasks across the crew), reportsTo: string (the Slack channel) }.`;

  let plan: DeploymentPlan;
  let live = true;
  try {
    plan = await askClaudeJSON<DeploymentPlan>({ system, prompt, maxTokens: 1200 });
  } catch (err) {
    if (!(err instanceof AINotConfiguredError)) {
      return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'failed' }, { status: 502 });
    }
    live = false;
    plan = {
      cadence: 'Daily 8:10am + on-signal',
      firstWeek: [
        'Recon: connect data sources and read the current account state',
        'Ship one on-brand marketing unit for approval',
        'Triage inbound leads and draft replies',
        'Wire profit tracking (Shopify/QuickBooks) as ground truth',
        'Post a daily flight-log to Slack',
      ],
      reportsTo: '#pixel-pilot',
    };
  }

  const record = { at: new Date().toISOString(), business, hired: hired.map((a) => a!.id), plan };
  await pushToList('pp:tools:employees', record);
  return NextResponse.json({
    ok: true,
    live,
    ...(live ? {} : { note: 'Preview plan — add ANTHROPIC_API_KEY to tailor it.' }),
    hired: hired.map((a) => ({ id: a!.id, name: a!.name, role: a!.role, command: a!.command })),
    plan,
  });
}
