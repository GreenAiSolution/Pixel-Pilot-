---
tags: [pixel-pilot, moc]
created: 2026-07-06
---

# 🚀 Pixel Pilot — Home

**The autonomous media buyer that flies your ad spend to profit.**
An immersive 3D marketing + product platform for the ads / media-buying niche.

> [!info] Quick facts
> - **Live site:** https://pixel-pilot-snowy.vercel.app
> - **Repo:** `GreenAiSolution/Pixel-Pilot-` (GitHub) · local `~/Pixel-Pilot`
> - **Stack:** Next.js 16 · React 19 · React Three Fiber · Tailwind v4 · TypeScript
> - **Host:** Vercel (auto-deploys `main`)

## Map of content
- [[Architecture]] — how the whole system fits together
- [[The Stack]] — **the business brain**: 41 apps, connectors & tools
- [[Agent Crew]] — the specialist operators
- [[App Connections]] — every integration + its status
- [[The Automator]] — the agent-creator flow
- [[Backend & API]] — engine modules + API routes
- [[Maverick Agent]] — the 24/7 autonomous operator
- [[Deployment]] — GitHub → Vercel pipeline
- [[Setup Checklist]] — what's left to wire up
- [[Status]] — live pulse of what's working
- [[📁 Codebase]] — **the entire project**, every source file mirrored as notes
- [[Architecture Board.canvas|🗺️ Architecture Board]] — visual Canvas of the whole system

## The two flows
1. **Product:** customer → [[The Automator]] → [[Backend & API|backend]] persists + runs it → [[App Connections|integrations]] fan out.
2. **Autonomy:** [[Maverick Agent|Maverick]] runs daily, ships creative + code, [[Deployment|deploys]] to the live site.

## Status at a glance
- 🟢 Live: site, [[Maverick Agent|Maverick]], Slack, Gmail, Higgsfield, GitHub, Vercel
- 🟡 Pending your keys: [[Setup Checklist|Upstash KV, Zapier hook, QuickBooks, Gemini billing]]

See [[Status]] for the current pulse.
