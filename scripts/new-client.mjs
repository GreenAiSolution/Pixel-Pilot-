#!/usr/bin/env node
// ─── PHX GROWTH · NEW CLIENT AGENT PACK ─────────────────────────────────────
// Turns a client intake JSON into an install-ready pack of five Claude Code
// subagents (the "AI employees") under clients/<slug>/.
//
//   npm run new:client -- path/to/intake.json
//   node scripts/new-client.mjs path/to/intake.json [--slug my-client] [--out dir]
//
// The intake format matches Pixel Automation System's client.config.json, plus
// an optional `agents` block for naming the employees. Blank template:
// clients/intake.template.json

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATES = join(ROOT, 'clients', 'templates');

// ── args ──────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const intakePath = args.find((a) => !a.startsWith('--'));
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
if (!intakePath) {
  console.error('Usage: npm run new:client -- path/to/intake.json [--slug name] [--out dir]');
  process.exit(1);
}

// ── intake ────────────────────────────────────────────────────────────────────
const intake = JSON.parse(readFileSync(resolve(intakePath), 'utf8'));
const biz = intake.business ?? {};
for (const field of ['name', 'industry']) {
  if (!biz[field]) {
    console.error(`Intake is missing business.${field} — see clients/intake.template.json`);
    process.exit(1);
  }
}

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const slug = flag('slug') ?? slugify(biz.name);
const outDir = resolve(flag('out') ?? join(ROOT, 'clients', slug));

const names = {
  sales: intake.agents?.sales ?? 'Rowan',
  dispatch: intake.agents?.dispatch ?? 'Sage',
  billing: intake.agents?.billing ?? 'Quill',
  care: intake.agents?.care ?? 'Wren',
  growth: intake.agents?.growth ?? 'Marlo',
};

const services = Array.isArray(intake.services) ? intake.services : [];
const priceOf = (s) =>
  s.priceFrom != null ? `from $${Number(s.priceFrom).toLocaleString('en-US')}${s.unit ? ` ${s.unit}` : ''}` : 'quote';
const servicesList = services.length
  ? services.map((s) => `- ${s.name} — ${priceOf(s)}`).join('\n')
  : '- (no services listed — quote everything, flag to the owner)';
const servicesInline = services.length
  ? services.map((s) => s.name).join(', ')
  : 'the service list';

const booking = intake.quotes?.includeBookingLink;
const vars = {
  SLUG: slug,
  BUSINESS: biz.name,
  OWNER: biz.owner ?? 'the owner',
  INDUSTRY: biz.industry,
  LOCATION: biz.location ?? 'local service area',
  VOICE: biz.tone ?? 'warm, professional, plain-spoken',
  AGENT_SALES: names.sales,
  AGENT_DISPATCH: names.dispatch,
  AGENT_BILLING: names.billing,
  AGENT_CARE: names.care,
  AGENT_GROWTH: names.growth,
  SERVICES_LIST: servicesList,
  SERVICES_INLINE: servicesInline,
  FOLLOWUP_DAYS: (intake.followUps?.cadenceDays ?? [1, 3, 7]).join(', '),
  BOOKING_LINE: booking ? `\n   Booking link: ${booking}` : '',
  REVIEW_PLATFORM: intake.reviews?.platform ?? 'Google',
  REVIEW_LINK_NOTE: intake.reviews?.link ? ` (${intake.reviews.link})` : '',
  MARKETING_PLATFORMS: (intake.marketing?.platforms ?? ['facebook', 'instagram']).join(', '),
};

const render = (tpl) =>
  tpl.replace(/\{\{(\w+)\}\}/g, (m, key) => {
    if (!(key in vars)) throw new Error(`Unknown template variable ${m}`);
    return vars[key];
  });

// ── generate ──────────────────────────────────────────────────────────────────
const AGENT_TEMPLATES = {
  'sales-closer': 'sales-closer.md.tpl',
  dispatch: 'dispatch.md.tpl',
  billing: 'billing.md.tpl',
  'client-care': 'client-care.md.tpl',
  growth: 'growth.md.tpl',
};

const agentsDir = join(outDir, '.claude', 'agents');
mkdirSync(agentsDir, { recursive: true });

for (const [id, tplFile] of Object.entries(AGENT_TEMPLATES)) {
  const tpl = readFileSync(join(TEMPLATES, tplFile), 'utf8');
  writeFileSync(join(agentsDir, `${slug}-${id}.md`), render(tpl));
}
writeFileSync(join(outDir, 'README.md'), render(readFileSync(join(TEMPLATES, 'PACK-README.md.tpl'), 'utf8')));
writeFileSync(join(outDir, 'client.json'), JSON.stringify(intake, null, 2) + '\n');

console.log(`✈  ${biz.name} — agent pack ready`);
console.log(`   ${outDir.replace(ROOT + '/', '')}/`);
console.log(`   ├─ .claude/agents/  (5 employees: ${Object.values(names).join(', ')})`);
console.log(`   ├─ client.json      (intake, reusable with Pixel Automation System)`);
console.log(`   └─ README.md        (install instructions for the client)`);
console.log(`\n   Install: cp -R ${join(outDir, '.claude').replace(ROOT + '/', '')} /path/to/client-workspace/`);
