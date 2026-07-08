# Pixel Pilot — n8n workflow exports

Importable n8n workflows for the Pixel Pilot automation spine. Each JSON here is a
full n8n export (`Import from File` in the n8n editor). The in-app metadata twin
lives in [`pixel-pilot/workflows.ts`](../pixel-pilot/workflows.ts), and any spine
workflow can be triggered in-app via `POST /api/pixel-pilot/workflows/<id>`.

## Audience Sync (`audience-sync.json`)

Lifecycle-aware custom audiences for Vector. On a schedule it asks our backend for
hashed membership deltas, then syncs three audiences to Meta/Google/TikTok behind
an approval gate:

- **Suppression** — customers + closed-won contacts → **excluded** from prospecting
- **Retarget** — warm (MQL/SQL/opportunity), stalled open deals
- **Seed → Lookalike** — closed-won contacts seed platform lookalikes

**Flow:** Daily Schedule → Compute Audiences (`GET /api/pixel-pilot/audiences`) →
`Auto-Approve?` → (else) Request Approval → Wait for Approval → `Approved?` →
Fan Apply → **Apply Meta · Apply Google · Apply TikTok** → Summarize Apply →
`Applied Clean?` → Commit Snapshot → Log Result.

### Where PII lives

Our backend computes segments from HubSpot and **SHA-256-hashes every email before
it leaves the app** — n8n and the platforms only ever see hashes. The compute
endpoint (`/api/pixel-pilot/audiences`) is guarded by `x-pp-signature` when
`N8N_WEBHOOK_SECRET` is set; the workflow sends that header.

### Approval

`Compute Audiences` returns `approval.autoApprove`. Small deltas (default `< 10%`
**and** `< 100` changes per segment, no newly-eligible lookalike) auto-apply.
Otherwise the workflow posts approve/reject links (the Wait node's resume URL) to
Slack and pauses until a reviewer clicks. Swap in n8n's native Slack "Send and Wait"
if you have Slack credentials.

### Idempotency & commit

Membership is diffed against the last **committed** snapshot in KV; only
adds/removes are pushed. After a clean apply the workflow `POST`s
`decision:'commit'` to promote the pending snapshot. If any platform errored, the
snapshot is **not** committed, so the next run retries the missed changes.

### Guarantees & environment

- **Dry-run:** `PP_DRY_RUN=true` → senders simulate (audiences aren't created/edited).
- **Retry/backoff:** each platform call retries 5× with exponential backoff.
- **Consent-gated:** retarget/seed exclude `hs_marketable_status = NON_MARKETABLE`;
  suppression ignores consent (exclusion is always allowed).
- **Create-if-missing:** platform audience ids are cached in n8n static data; Google
  expects pre-created Customer Match lists via `GOOGLE_USERLIST_*`.

| Var | Purpose |
|---|---|
| `PP_APP_URL`, `HUBSPOT_PORTAL_ID`, `N8N_WEBHOOK_SECRET` | Reach + auth the compute/commit endpoint |
| `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID`, `META_LOOKALIKE_COUNTRY` | Meta custom audiences + lookalike |
| `GOOGLE_ADS_CUSTOMER_ID`, `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_ACCESS_TOKEN`, `GOOGLE_USERLIST_{SUPPRESSION,RETARGET,SEED}` | Google Customer Match offline jobs |
| `TIKTOK_ACCESS_TOKEN`, `TIKTOK_ADVERTISER_ID` | TikTok custom audiences + lookalike |
| `SLACK_WEBHOOK_URL`, `PP_DRY_RUN` | Notifications + dry-run |

> The platform apply nodes match each vendor's documented custom-audience / customer-match
> endpoints, but API versions and field names drift — verify against current docs before
> production, or swap in n8n's native ad-platform nodes with managed credentials.

## Pipeline Truth Sync (`pipeline-truth-sync.json`)

Closes the CRM-truth loop for lead-gen: when a HubSpot **deal changes stage
(especially → closed-won)**, it pushes an **offline conversion carrying real deal
value** back to the ad platforms, so the buyer optimizes to closed-won pipeline
value instead of form-fills.

**Flow:** Deal Stage Changed (webhook) → Extract & Guard → Check Idempotency →
`New Deal?` → Read Deal → Read Contact → Assemble Conversion → `Closed-Won?` →
**Meta CAPI · Google Ads offline import · TikTok Events API** (in parallel) →
Summarize & Mark → Log to Slack.

### Trigger

Point a HubSpot webhook at the n8n webhook URL for this workflow
(`<N8N_BASE_URL>/webhook/pp-pipeline-truth-sync`):

- **HubSpot → Settings → Integrations → Private Apps → Webhooks**, subscribe to
  `deal.propertyChange` on `dealstage` (and/or `deal.creation`), or
- a HubSpot **Workflow** with a "Send webhook" action on stage change.

You can also fire it in-app for replay/backfill:
`POST /api/pixel-pilot/workflows/pipeline-truth-sync` (returns a dry-run receipt
when `N8N_BASE_URL` is unset — same behavior as the rest of the spine).

### Guarantees

- **Idempotent** — dedupes on `dealId:stage` via n8n static data; a deal already
  synced is skipped (`New Deal?` → Log Skip). Marked only after a successful send
  (or a clean dry-run); if **every** platform errors it is *not* marked, so the
  next event retries. _Static data persists across production (active) executions
  only; for cross-instance dedupe, back it with Redis/KV — swap the get/set in
  `Check Idempotency` + `Summarize & Mark`._
- **Retry + backoff** — each platform sender retries up to 5× with exponential
  backoff + jitter (cap 30s); HubSpot reads use n8n's node retry. `Read Contact`
  continues on error so a deal with no contact still syncs.
- **Dry-run** — set `PP_DRY_RUN=true` (or POST `{ "dryRun": true }`). Senders skip
  the real API call and report `dry-run`; Slack still posts the summary.
- **Clear logging** — every branch logs a structured line; Slack gets a per-deal
  summary with each platform's status, HTTP code, and the deal value.

### Environment

| Var | Purpose |
|---|---|
| `HUBSPOT_PRIVATE_APP_TOKEN` | Read the deal + associated contact |
| `META_CAPI_TOKEN`, `META_PIXEL_ID` | Meta Conversions API (offline `Purchase`, `fbc`) |
| `GOOGLE_ADS_CUSTOMER_ID`, `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_ACCESS_TOKEN`, `GOOGLE_ADS_CONVERSION_ACTION` | Google Ads `uploadClickConversions` (gclid) |
| `TIKTOK_ACCESS_TOKEN`, `TIKTOK_EVENT_SET_ID` | TikTok Events API offline event (ttclid) |
| `SLACK_WEBHOOK_URL` | Result notification (logs to console if unset) |
| `PP_DRY_RUN` | `true` → simulate all sends |
| `PP_CONVERSION_CURRENCY` | Currency for conversion value (default `USD`) |

Any platform with missing env or a missing click id is reported as
`skipped`/`error` in the Slack summary rather than failing the run — the workflow
never drops the loop over one channel.

### Click ids

Conversions are keyed on the click ids captured at lead time and stored as
`pp_gclid` / `pp_fbclid` / `pp_ttclid` on the HubSpot **deal** (preferred) or the
associated **contact** (fallback). Meta/TikTok/Google each fire only when their
matching click id is present.

> Google Ads `GOOGLE_ADS_ACCESS_TOKEN` is a short-lived OAuth token — refresh it
> upstream, or replace the `Google Offline Import` node with n8n's Google Ads
> credential. The node shape matches the REST `uploadClickConversions` call.
