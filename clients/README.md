# Client Agent Packs

The repeatable path from "signed client" to "five AI employees running their
business." This is the productized version of what was hand-built for Eagle
Landscaping (`.claude/agents/eagle-*.md`) — same crew, any business, minutes
instead of days.

## The flow

```
intake JSON  ──▶  npm run new:client  ──▶  clients/<slug>/
(one form)        (generator)              ├─ .claude/agents/   5 subagents
                                           ├─ client.json       reusable intake
                                           └─ README.md         client install guide
```

1. **Fill the intake.** Copy `intake.template.json`, fill in the business —
   name, owner, industry, voice, services + prices, follow-up cadence, review
   link, marketing platforms. This is the only manual step.

2. **Generate.**

   ```bash
   npm run new:client -- clients/<slug>/intake.json
   ```

3. **Install at the client.** Copy the generated `.claude/` folder into any
   directory where Claude Code runs for that client. The five employees are
   immediately invokable: `@<slug>-sales-closer`, `@<slug>-dispatch`,
   `@<slug>-billing`, `@<slug>-client-care`, `@<slug>-growth`.

4. **Connect the pipes** (each optional — agents draft-and-report until live):
   Zapier MCP (Slack, Gmail, Sheets, QuickBooks), Google Calendar.

5. **Go 24/7 (optional).** The same `client.json` drops into
   [Pixel Automation System](~/Pixel-Automation-System)'s `client.config.json`
   for the always-on webhook engine (instant quotes, follow-up sequencer,
   review harvester, marketing autopilot, owner report).

A complete generated example lives at `summit-plumbing/` — that's exactly what
a client receives.

## The five employees

| Default name | Role | Owns |
|---|---|---|
| Rowan | Sales Closer | Lead → quote → booked, relentless follow-up |
| Sage | Dispatch & Scheduling | Calendar, routes, rebooks, arrival windows |
| Quill | Billing & QuickBooks | Estimates, invoices, AR chase, cash summary |
| Wren | Client Care & Retention | Satisfaction checks, upsells, win-backs |
| Marlo | Growth & Marketing | Reviews, GBP, seasonal offers, CPL by source |

Names are per-client configurable in the intake's `agents` block.

## Customizing further

The generated pack is a **starting point** — plain markdown, meant to be edited.
For industry-specific depth (e.g. weather-driven rebooking for landscaping,
permit tracking for contractors), edit the generated agents directly or extend
the templates in `templates/`. What's priced as "AI Employees" ($2,000, see
`phx-growth/pricing.ts`) is this pack plus that tailoring plus the pipe hookup.
