# Client Brain — the deployable core of the Autonomous Growth OS

This directory is what makes the PHX Growth agent fleet a **product** instead of a
bespoke crew. Every agent reads the **active Client Brain** before it acts. Nothing
about a business — brand, offer, pricing, ICP, compliance posture, channels,
connectors, autonomy rules, reporting destination — is hardcoded in an agent. It
all lives here, as data.

**The OS ships ready for any business but tied to none.** The default tenant is the
UNCONFIGURED placeholder — until `CLIENT_ID` points at a real, registered Client Brain,
every agent stops and asks to be set up. It will never run someone else's business by
accident. PHX Growth is registered only as a worked *example* of a fully-filled Brain.

## Files
| File | Role |
|---|---|
| `types.ts` | The `ClientBrain` schema + `isConfigured()` gate every agent conforms to |
| `_default.ts` | The UNCONFIGURED placeholder — what the OS runs before it's pointed at a business |
| `reference.ts` | PHX Growth — a worked *example* tenant (run it with `CLIENT_ID=phx-growth`) |
| `TEMPLATE.ts` | Blank tenant to copy for a new install |
| `index.ts` | Resolver — `getActiveClient()` returns the tenant named by `CLIENT_ID`, else UNCONFIGURED |

## Installing the OS for a new business (the high-ticket deliverable)
1. **Interview the client** and collect: brand system, offer/pricing, ICP,
   compliance category, which channels/connectors are live.
2. `cp TEMPLATE.ts <client-slug>.ts` and fill every field. Leave a connector
   `false` until it is truly wired — agents auto-degrade to *draft + stage* when a
   connector is dark; they never fake an integration.
3. Register the tenant in `index.ts` `REGISTRY`.
4. Set `CLIENT_ID=<client-slug>` in the environment.
5. Run the **readiness check** (`ops-commander`): typecheck, connector health,
   tracking + profit inputs, compliance posture, at least one measurable
   conversion event.
6. Start SAFE — every autonomy gate off. Turn gates up per-tenant via env as the
   client learns to trust the system.

## Autonomy, in one place
Gates default to **stage-for-approval**. The client dials them up as trust builds
(env flags, per gate). This is the difference between "an assistant that drafts"
and "an operator that ships" — and it is a setting, not a rewrite.

The agent fleet that reads this Brain is documented in
[`.claude/agents/README.md`](../../.claude/agents/README.md).
