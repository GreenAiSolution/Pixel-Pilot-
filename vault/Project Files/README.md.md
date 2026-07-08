---
tags: [pixel-pilot, source]
file: README.md
---

# `README.md`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/README.md`

`````markdown
# Pixel Pilot

**The autonomous media buyer that flies your ad spend to profit.**

An immersive, 3D marketing + product platform for the ads / media-buying niche.
Not a dashboard — an autonomous media buyer that flies Meta, Google & TikTok to
*real profit*, 24/7, with Higgsfield-powered creative and an n8n automation spine.

Built with **Next.js 16**, **React 19**, **React Three Fiber**, and **Tailwind v4**.

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build && npm start   # production
```

Nothing is required in `.env` to run or demo — every integration checks for its
credentials at request time and falls back to a believable simulation.

## What's inside

```
app/
  page.tsx                     the cinematic platform (all 10 services, connectors,
                               Creative Forge, n8n automation, pricing)
  layout.tsx                   root layout — fonts, metadata, <Shell>
  globals.css                  Tailwind v4 theme tokens
  api/pixel-pilot/
    connectors/[provider]/     GET → live OAuth consent URL (+ CSRF state cookie)
    higgsfield/                POST → fire a Creative Forge render
    workflows/[id]/            POST → trigger an n8n workflow webhook

components/pixel-pilot/
  shell.tsx                    nav + footer + scroll progress (client chrome)
  flight-scene.tsx             bespoke React Three Fiber scene
  creative-forge.tsx           live Higgsfield demo (client)

pixel-pilot/                   the engine — pure typed data + wiring (see its README)
  connectors.ts services.ts workflows.ts higgsfield.ts creative-apps.ts pricing.ts

lib/cn.ts                      class-name helper
```

## The engine

The `pixel-pilot/` folder is the product's brain — no React, just typed data and
wiring the UI and API routes both import from. See [`pixel-pilot/README.md`](./pixel-pilot/README.md)
for the four connectors (Meta Ads, Google Ads, TikTok Ads, Shopify), the ten
services, the n8n workflows, the Higgsfield client, and the full environment
reference.

## The ten services

Autonomous Media Buyer · Profit-Optimized (not ROAS) · Cross-Channel Conductor ·
Creative Genome Engine · Synthetic Pre-Testing · Self-Improving Data Flywheel ·
Compliance-Safe Autopilot · Attribution Truth Engine · Zero-to-Live in <60min ·
Impression-Level Generative Creative.

`````
