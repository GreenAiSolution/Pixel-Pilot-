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
| `index.ts` | Barrel + `PIXEL_PILOT` brand constants. |

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

## Daily Board Meeting

Every morning a three-seat AI board holds a stand-up, reads the overnight numbers,
and leaves behind persisted minutes. A Slack message then points the user at the
day's minutes on a new page.

**The board** (`board.ts`):

| Seat | Name | Role | Owns |
| --- | --- | --- | --- |
| `atlas` | Atlas | Chief Growth Officer | Media buying, budget allocation, ROAS, scale-or-kill |
| `nova` | Nova | Chief Creative Officer | Ad creative performance, creative refresh, hooks/angles |
| `ledger` | Ledger | Chief Revenue Officer | Pipeline, revenue, CAC/LTV, cash, forecast |

**The page** — recent meetings live at **`/boardroom`**; a single day's full minutes
(agenda, each member's brief, decisions, action items, summary) at
**`/boardroom/{YYYY-MM-DD}`**.

**Wired endpoints**

| Route | Does |
| --- | --- |
| `GET /api/pixel-pilot/board` | Lists recent meetings (`?date=YYYY-MM-DD` for one, `?limit=N`). |
| `POST /api/pixel-pilot/board` | Runs a meeting now (optional `{ "date": "YYYY-MM-DD" }`) and returns the minutes. |
| `GET /api/pixel-pilot/board/cron` | Vercel Cron target: runs the meeting, then posts the Slack link. GET-only. |

**The cron** — `vercel.json` schedules the cron:

```
{ "path": "/api/pixel-pilot/board/cron", "schedule": "0 6 * * *" }
```

`0 6 * * *` means **06:00 UTC** — Vercel Crons always run in **UTC**. Adjust the
`schedule` for your timezone (e.g. `0 13 * * *` is 6am US Pacific during PST /
7am during PDT — pick the UTC hour that matches your local 6am).

**Environment (all optional — everything dry-runs with an empty .env)**

```
ANTHROPIC_API_KEY         # optional — real per-member briefs via the Anthropic Messages
                          #   API (plain fetch, no SDK, model claude-haiku-4-5-20251001).
                          #   Absent → deterministic templated briefs.
ZAPIER_HOOK_URL           # optional — Slack "board meeting ready" message (via fireZapier).
                          #   Absent → dry-run receipt.
CRON_SECRET               # optional — when set, the cron requires
                          #   `Authorization: Bearer ${CRON_SECRET}` (Vercel sends it
                          #   automatically); when unset, the cron is open (demo-friendly).
KV_REST_API_URL / _TOKEN  # optional — durable persistence of minutes (Vercel KV / Upstash).
                          #   Absent → in-memory for the process.
```
