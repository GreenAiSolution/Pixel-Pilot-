---
tags: [phx-growth, source, moc]
---

# 📁 Codebase

The complete PHX Growth repo, mirrored as notes under **Project Files/**. Back to [[🚀 PHX Growth — Home]].

> [!info] Source of truth
> Live repo `GreenAiSolution/PHX-Growth-` (local `~/PHX-Growth`). Snapshot — edit code in the repo, then run `node scripts/sync-vault.mjs` to refresh. `package-lock.json` omitted; images/video are attached raw in the Obsidian copy.

**104 files** mirrored.

## File tree

```
.claude/agents/backend-reviewer.md
.claude/agents/backend-runner.md
.claude/agents/eagle-billing.md
.claude/agents/eagle-client-care.md
.claude/agents/eagle-dispatch.md
.claude/agents/eagle-growth.md
.claude/agents/eagle-sales-closer.md
.claude/agents/maverick.md
.claude/agents/pixel-automation-engineer.md
.claude/agents/pixel-compliance-guard.md
.claude/agents/pixel-creative-director.md
.claude/agents/pixel-growth-strategist.md
.claude/agents/pixel-media-buyer.md
.claude/agents/pixel-ops-commander.md
.claude/agents/pixel-profit-analyst.md
.claude/agents/vercel-ops.md
.claude/launch.json
.claude/skills/phx-growth-daily-marketing/SKILL.md
.gitignore
PHX-Growth-Cold-Call-Script.md
README.md
app/(marketing)/agents/page.tsx
app/(marketing)/automation/page.tsx
app/(marketing)/automator/page.tsx
app/(marketing)/connectors/page.tsx
app/(marketing)/film/page.tsx
app/(marketing)/forge/page.tsx
app/(marketing)/layout.tsx
app/(marketing)/page.tsx
app/(marketing)/pricing/page.tsx
app/(marketing)/results/page.tsx
app/(marketing)/services/page.tsx
app/(marketing)/stack/page.tsx
app/(marketing)/studio/page.tsx
app/api/eagle/lead/route.ts
app/api/eagle/quickbooks/callback/route.ts
app/api/eagle/quickbooks/connect/route.ts
app/api/phx-growth/automations/route.ts
app/api/phx-growth/connectors/[provider]/callback/route.ts
app/api/phx-growth/connectors/[provider]/route.ts
app/api/phx-growth/connectors/quickbooks/callback/route.ts
app/api/phx-growth/connectors/quickbooks/route.ts
app/api/phx-growth/debug-env/route.ts
app/api/phx-growth/higgsfield/route.ts
app/api/phx-growth/stack/route.ts
app/api/phx-growth/tools/ads/route.ts
app/api/phx-growth/tools/brand/route.ts
app/api/phx-growth/tools/content/route.ts
app/api/phx-growth/tools/employees/route.ts
app/api/phx-growth/tools/funnel/route.ts
app/api/phx-growth/tools/launch-plan/route.ts
app/api/phx-growth/tools/pretest/route.ts
app/api/phx-growth/tools/route.ts
app/api/phx-growth/tools/website/route.ts
app/api/phx-growth/workflows/[id]/route.ts
app/api/phx-growth/zapier/route.ts
app/eagle/layout.tsx
app/eagle/ops/page.tsx
app/eagle/page.tsx
app/globals.css
app/layout.tsx
app/opengraph-image.alt.txt
app/sites/[slug]/route.ts
app/twitter-image.alt.txt
components/eagle/quote-form.tsx
components/phx-growth/automation-graph.tsx
components/phx-growth/connection-banner.tsx
components/phx-growth/creative-forge.tsx
components/phx-growth/flight-scene.tsx
components/phx-growth/sections.tsx
components/phx-growth/shell.tsx
eagle/agents.ts
eagle/company.ts
eagle/index.ts
eagle/quickbooks.ts
eagle/services.ts
eagle/workflows.ts
eslint.config.mjs
lib/cn.ts
next.config.ts
package.json
phx-growth/README.md
phx-growth/agents.ts
phx-growth/ai.ts
phx-growth/automations.ts
phx-growth/connectors.ts
phx-growth/creative-apps.ts
phx-growth/executor.ts
phx-growth/higgsfield.ts
phx-growth/index.ts
phx-growth/pricing.ts
phx-growth/proof.ts
phx-growth/quickbooks.ts
phx-growth/services.ts
phx-growth/stack.ts
phx-growth/store.ts
phx-growth/tools.ts
phx-growth/workflows.ts
postcss.config.mjs
sales/cold-call-script.md
scripts/generate-brand-ad.mjs
scripts/marketing-angle.mjs
scripts/sync-vault.mjs
tsconfig.json
```
