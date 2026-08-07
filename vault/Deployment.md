---
tags: [phx-growth, devops]
---

# Deployment

## Pipeline
```
GitHub repo (PHX-Growth-)  →  Vercel  →  Live site (phx-growth-snowy.vercel.app)
```
- Vercel **auto-deploys `main`** — a merged PR is a live release.
- Vercel project: `phx-growth` (team: *jaden green's projects*).
- Node 20+ on Vercel (local dev is Node 18 — `next build` runs on CI, not locally).

## Workflow rules
- Never push straight to `main`; branch → PR → merge. ([[Maverick Agent|Maverick]] follows this too.)
- Verify locally with `npx tsc --noEmit` and `npm run lint` before shipping.
- A failed Vercel build never promotes — the live site stays on the last good deploy.

## Local dev
```bash
cd ~/PHX-Growth
npm install
npm run dev      # http://localhost:3000
```

Related: [[Architecture]] · [[Setup Checklist]]
