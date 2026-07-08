---
tags: [pixel-pilot, source]
file: pixel-pilot/README.md
---

# `pixel-pilot/README.md`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/pixel-pilot/README.md`

`````markdown
# Pixel Pilot — the autonomous media buyer

The premium sub-brand inside Nexus Studio. Pixel Pilot flies a brand's paid media
(Meta, Google, TikTok) to **real profit** — 24/7, hands-off — and forges its own
creative with Higgsfield along the way.

This folder is the **engine**: pure data + wiring, no React. The **surface** lives
in `app/pixel-pilot/*` and `components/pixel-pilot/*` and imports everything from
here via the `@/pixel-pilot` barrel.

## Layout

| File | Role |
| --- | --- |
| `connectors.ts` | The 4 connectors (Meta Ads, Google Ads, TikTok Ads, Shopify) as fully-typed OAuth definitions + `buildAuthUrl()`. |
| `services.ts` | All 10 services on the Flight Deck — single source of truth for the marketing surface and the 3D orbit. |
| `workflows.ts` | Real n8n workflow graphs (nodes + connections) + webhook paths — the automation spine. |
| `higgsfield.ts` | Higgsfield creative client + `SHOWCASE`: real Higgsfield renders (Soul v2 stills + Kling 3.0 Turbo reels), one per vibe, so the Forge and gallery always show genuine output. Real render when keyed; the showcase stands in otherwise. |
| `creative-apps.ts` | The in-platform apps a client opens (Creative Forge, Genome Lab, …). |
| `pricing.ts` | Premium retainer + performance tiers. |
| `agents.ts` | The seven autonomous operators that run strategy, buying, creative, profit, compliance, automation and ops. |
| `index.ts` | Barrel + `PIXEL_PILOT` brand constants. |

## Agent Crew

The app now has a typed agent roster in `agents.ts`, and each command has a
matching Claude subagent prompt under `.claude/agents/`:

| Command | Owns |
| --- | --- |
| `@pixel-growth-strategist` | URL-to-launch strategy, personas, offers and channel mix. |
| `@pixel-media-buyer` | Cross-channel budget moves, scaling, cutting and optimization logs. |
| `@pixel-creative-director` | Creative genome diagnosis, Higgsfield briefs and fatigue refresh. |
| `@pixel-profit-analyst` | Shopify/QuickBooks truth, margin checks and attribution confidence. |
| `@pixel-compliance-guard` | Policy review, rewrites, blocking and escalation. |
| `@pixel-automation-engineer` | n8n/Zapier/OAuth wiring, deploy manifests and graceful fallbacks. |
| `@pixel-ops-commander` | Release readiness, Vercel health and incident coordination. |

## Wired endpoints

| Route | Does |
| --- | --- |
| `GET /api/pixel-pilot/connectors/[provider]` | Mints a live OAuth consent URL (302) or a legible 503 when creds are missing. Sets a CSRF `state` cookie. |
| `POST /api/pixel-pilot/higgsfield` | Fires a Higgsfield render for the Creative Forge. |
| `POST /api/pixel-pilot/workflows/[id]` | Triggers an n8n workflow webhook (dry-run receipt when `N8N_BASE_URL` is unset). |

## Environment (all optional — the platform degrades gracefully)

```
# Connectors
META_ADS_CLIENT_ID / META_ADS_CLIENT_SECRET
GOOGLE_ADS_CLIENT_ID / GOOGLE_ADS_CLIENT_SECRET
TIKTOK_ADS_CLIENT_ID / TIKTOK_ADS_CLIENT_SECRET
SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET

# Creative
HIGGSFIELD_API_KEY        # HIGGSFIELD_API_URL optional, defaults to api.higgsfield.ai/v1

# Automation
N8N_BASE_URL              # N8N_WEBHOOK_SECRET optional (sent as x-pp-signature)
```

Nothing here is required to build or to render the marketing site — every
integration checks for its credentials at request time and falls back to a
believable simulation, so the site is always demoable.

Live at **`/pixel-pilot`**.

`````
