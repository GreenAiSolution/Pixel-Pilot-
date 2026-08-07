---
tags: [phx-growth, integrations]
---

# App Connections

Every app the project touches, and where it stands.

## 🟢 Live / connected
| App | Role |
|---|---|
| **Slack** | `#phx-growth` — [[Maverick Agent\|Maverick]] posts flight-logs; staging |
| **Gmail** | Email drafts (never auto-sends) |
| **Higgsfield** | Ad visuals / creative generation |
| **GitHub** | Source of truth (`PHX-Growth-`) |
| **Vercel** | Auto-deploys `main` → live site |

## 🟡 Needs your key
| App | What's needed |
|---|---|
| **Upstash KV** | `KV_REST_API_URL` + `KV_REST_API_TOKEN` on the `phx-growth` project (see [[Setup Checklist]]) |
| **Zapier hook** | `ZAPIER_HOOK_URL` — fans out to your apps |
| **QuickBooks** | Intuit app → `QUICKBOOKS_CLIENT_ID/SECRET/REDIRECT_URI` |
| **Gemini** | Billing on the API key (visuals fall back to Higgsfield until then) |
| **Ad connectors** | Meta / Google / TikTok / Shopify client IDs + secrets |
| **Google Sheets** | Connected but **read-only** scope — logging moved to Slack + `out/` |

## ⚪ Optional
- **n8n** — set `N8N_BASE_URL` to run the ad-loop workflows (dry-run otherwise).

Related: [[Architecture]] · [[Setup Checklist]] · [[Backend & API]]
