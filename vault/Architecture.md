---
tags: [pixel-pilot, architecture]
---

# Architecture

Top-down flow of the whole system. See [[App Connections]] for per-integration status.

> [!tip] Visual version
> Open **[[Architecture Board.canvas|🗺️ Architecture Board]]** for a pan/zoom Canvas of everything below, color-coded by status.

## Product flow
```
Customer
  → The Automator (design + deploy an automation)
     → /api/pixel-pilot/automations  (persist + run)
        → Upstash KV store   (saves the deploy)
        → Executor           (fires the integrations)
             → n8n engine     (optional, ad-loop workflows)
             → Zapier hook    → Slack · Gmail · Sheets · QuickBooks · +9,000 apps
             → QuickBooks      (native, Intuit OAuth)
             → Higgsfield      (ad visuals)
```

## Autonomy + delivery loop
```
Maverick (24/7, daily 8:10am)
  → Higgsfield (creative)  → Slack #pixel-pilot (reports)  → GitHub PRs (ships code)
GitHub repo → Vercel (auto-deploys main) → Live site
```

## Layers
- **Surface** — `app/(marketing)` (marketing site + [[The Automator]]).
- **Engine** — `pixel-pilot/*.ts` barrel (types, data, wiring). See [[Backend & API]].
- **API** — `app/api/pixel-pilot/*` route handlers.
- **Persistence** — `pixel-pilot/store.ts` (Upstash KV + in-memory fallback).
- **Execution** — `pixel-pilot/executor.ts` (n8n + Zapier fan-out).

Related: [[The Automator]] · [[Backend & API]] · [[Maverick Agent]]
