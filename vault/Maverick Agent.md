---
tags: [pixel-pilot, agent, maverick]
---

# Maverick Agent

The 24/7 autonomous operator. File: `.claude/agents/maverick.md`.

> [!quote] Callsign
> **Maverick — Squadron Commander.** One operator who runs the whole platform: marketing, creative, lead-to-revenue, backend/product, and orchestration.

## How to reach him
- **On demand:** `@maverick` in Claude Code on this project.
- **Automatic:** scheduled cloud task `maverick-pixel-pilot-heartbeat`, **daily 8:10am**.
- **Reports:** posts flight-logs to Slack **#pixel-pilot** as *Maverick · Pixel Pilot*.

## His 5 instruments
Gmail · Google Calendar · Zapier (Slack) · Higgsfield (creative) · GitHub.

## Each flight
Recon → ship one on-brand marketing unit → work leads → one product improvement via **branch + PR** (never straight to `main`) → post a report.

## Guardrails
Safe-by-default staging. No auto-publish to public social, no auto-send cold email, no merge to `main` without explicit go. Defensible claims only.

Logging = local `out/` files + `#pixel-pilot` (not Google Sheets).

Related: [[Architecture]] · [[Deployment]] · [[App Connections]]
