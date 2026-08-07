---
tags: [phx-growth, setup]
---

# Setup Checklist

What's left to take the project from "code live" to "fully wired." See [[App Connections]] for context.

## Persistence — [[App Connections|Upstash KV]]
- [ ] Add `KV_REST_API_URL` to the **`phx-growth`** Vercel project (Production)
- [ ] Add `KV_REST_API_TOKEN` to the same project (Production)
- [ ] Redeploy → confirm `GET /api/phx-growth/automations` returns `"durable": true`
- [ ] Remove the temporary `debug-env` route

## Zapier fan-out
- [ ] Create a **Webhooks by Zapier → Catch Hook** Zap; copy the URL
- [ ] Set `ZAPIER_HOOK_URL` in Vercel
- [ ] Add the Zap actions (QuickBooks / Slack / Sheets…)

## Native QuickBooks
- [ ] Create an Intuit app at developer.intuit.com (Client ID + Secret)
- [ ] Redirect URI: `https://phx-growth-snowy.vercel.app/api/phx-growth/connectors/quickbooks/callback`
- [ ] Set `QUICKBOOKS_CLIENT_ID`, `QUICKBOOKS_CLIENT_SECRET`, `QUICKBOOKS_REDIRECT_URI`, `QUICKBOOKS_ENV`
- [ ] Visit `/api/phx-growth/connectors/quickbooks` to connect

## Visuals
- [ ] Enable **billing** on the Gemini API key (visuals fall back to Higgsfield until then)

## Ad connectors (when ready)
- [ ] Meta / Google / TikTok / Shopify client IDs + secrets

## Optional
- [ ] Stand up **n8n**, set `N8N_BASE_URL` to run ad-loop workflows for real

Related: [[Status]] · [[Deployment]]
