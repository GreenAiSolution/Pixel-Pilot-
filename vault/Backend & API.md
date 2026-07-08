---
tags: [pixel-pilot, backend]
---

# Backend & API

## Engine modules (`pixel-pilot/`)
- `connectors.ts` — OAuth defs for Meta / Google / TikTok / Shopify.
- `services.ts`, `pricing.ts`, `creative-apps.ts` — product data.
- `workflows.ts` — the 4 n8n workflow definitions (budget-reallocation, creative-refresh, compliance-guard, zero-to-live).
- `automations.ts` — the [[The Automator|Automator]]'s config model + graph builder + manifest.
- `store.ts` — **persistence**: Upstash KV REST + in-memory fallback; auto-detects the env var names under any prefix.
- `executor.ts` — **execution**: `triggerWorkflow` (n8n) + `fireZapier` (fan-out).
- `quickbooks.ts` — native QuickBooks Online (Intuit OAuth2 + refresh + `companyInfo` / `createCustomer`).
- `higgsfield.ts` — creative generation wiring.

## API routes (`app/api/pixel-pilot/`)
- `automations` — `POST` persist + run a deploy · `GET` list deploys.
- `connectors/[provider]` (+ `/callback`) — ad-platform OAuth.
- `connectors/quickbooks` (+ `/callback`) — QuickBooks OAuth.
- `workflows/[id]` — trigger an n8n workflow (dry-run without `N8N_BASE_URL`).
- `zapier` — forward an event to the Zapier Catch Hook.
- `higgsfield` — creative endpoint.

> [!note] Temporary
> `debug-env` route exists to diagnose the [[Setup Checklist|Upstash KV]] env names — remove once persistence is durable.

Related: [[Architecture]] · [[The Automator]] · [[App Connections]]
