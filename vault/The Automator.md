---
tags: [pixel-pilot, product]
---

# The Automator

The agent-creator. File: `app/(marketing)/automator/page.tsx`.

A 3-step "design studio" (not a form):
1. **Select a service** — pick from the service catalog.
2. **Design the automation** — trigger, channels, objective, autonomy + aggressiveness sliders, guardrails, notifications, and **Sync to QuickBooks**. The workflow graph recomposes live on the right.
3. **Review & deploy** — builds a manifest and posts it to [[Backend & API|/api/pixel-pilot/automations]].

On deploy, the backend **persists** the automation ([[App Connections|Upstash KV]]) and **runs** it — firing the n8n workflow, the Zapier fan-out, and (opt-in) a live QuickBooks check — returning a **receipt per integration**.

Related: [[Architecture]] · [[Backend & API]]
