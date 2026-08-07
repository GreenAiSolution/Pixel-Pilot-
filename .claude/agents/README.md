# The Autonomous Growth OS — Agent Fleet

This is the product PHX Growth installs into a client business and operates as a
high-ticket managed service: a fleet of specialist AI operators that runs a whole
business's growth 24/7. It is **business-agnostic** — every agent reads the active
**[Client Brain](../../phx-growth/clients/README.md)** before it acts, so the same fleet
runs any tenant. It ships pointed at **no** business: the default tenant is the
UNCONFIGURED placeholder, and every agent **halts and asks for setup** until `CLIENT_ID`
names a real Client Brain (`isConfigured()`). PHX Growth is registered only as a worked
example, run explicitly with `CLIENT_ID=phx-growth`.

## Why this is one system, not 16 prompts
Every agent conforms to the same contract, which is what makes them interoperate and
what makes the service feel engineered rather than improvised:

1. **Reads first** — the Client Brain (brand, offer, ICP, compliance, connectors,
   autonomy, workspace) plus the relevant repo brain files. No agent operates blind or
   hardcodes a tenant.
2. **Operating loop** — deterministic numbered steps.
3. **Handoffs** — named upstream/downstream agents, so work composes.
4. **Autonomy & guardrails** — driven by the Brain's `autonomy` gates (a *setting*, not
   a rewrite): stage-for-approval by default, ship-freely as the client turns gates up.
5. **Reports** — a consistent run-log, plain English, status first.

Three rules hold fleet-wide: **no business, no action** (on an unconfigured Brain, stop
and ask for setup — never guess a brand or run another business's playbook); **defensible
claims only** (obey `brand.claimsPolicy` + route risk to compliance); and **honest
degradation** (a connector the Brain marks dark must fail clean and be reported — never
faked).

## The roster
| Agent | Owns |
|---|---|
| **commander** | Orchestrates the whole fleet + the 24/7 heartbeat (model: opus) |
| **ops-commander** | Release readiness, incident response, new-tenant install gate |
| **growth-strategist** | URL/brief → launchable profit-first flight plan |
| **media-buyer** | Moves budget toward marginal profit across channels |
| **creative-director** | Diagnoses fatigue, briefs the next winning creative |
| **compliance** | Clears claims/targeting before launch |
| **profit-analyst** | Ties optimization to money that actually lands |
| **demand-gen** | Proof, reputation, cost-per-lead-by-source |
| **sales-closer** | Works inbound leads → booked demos → won deals |
| **billing** | Won deal → invoice → AR chase → cash/MRR summary |
| **client-success** | Onboarding, retention, upsell, win-back |
| **scheduler** | Demos, cadence, the daily run sheet |
| **automation-engineer** | Wires + verifies the integrations |
| **backend-reviewer** | Reviews platform backend code before deploy |
| **backend-runner** | Tests the API endpoints end-to-end locally |
| **vercel-ops** | Checks the live backend in production |

## The relays that make it flow
```
commander ──delegates──▶ every specialist, holds the plan, reports the run

REVENUE:   sales-closer ─▶ billing ─▶ client-success ─▶ demand-gen (proof)
                     └──────────────▶ scheduler (demos + cadence)
GROWTH:    growth-strategist ─▶ media-buyer ◀─ profit-analyst
                     └─▶ creative-director ─▶ compliance ─▶ (launch)
PLATFORM:  automation-engineer ─▶ backend-reviewer ─▶ backend-runner ─▶
                     ops-commander ─▶ vercel-ops (production)
```

## Deploying the OS for a new business
See **[phx-growth/clients/README.md](../../phx-growth/clients/README.md)**: interview the
client, stamp a Client Brain from `TEMPLATE.ts`, register it, set `CLIENT_ID`, run the
`ops-commander` readiness check, and start with every autonomy gate SAFE.
