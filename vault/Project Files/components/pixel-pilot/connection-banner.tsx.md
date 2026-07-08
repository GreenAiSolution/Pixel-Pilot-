---
tags: [pixel-pilot, source]
file: components/pixel-pilot/connection-banner.tsx
---

# `components/pixel-pilot/connection-banner.tsx`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/components/pixel-pilot/connection-banner.tsx`

````tsx
"use client";

/* eslint-disable react-hooks/set-state-in-effect --
 * The effect reads the post-OAuth status off window.location (a browser-only
 * external system unavailable during render/SSR) and mirrors it into state —
 * exactly the "sync from an external system on mount" the rule permits. It runs
 * once, so there is no cascading-render concern. */

// ─── PIXEL PILOT · CONNECTION BANNER ─────────────────────────────────────────
// After the OAuth round-trip, the callback route redirects home with
// ?connected=<id> or ?connect_error=<id>[&reason=...]. This reads that off the
// URL (via window.location to avoid forcing the page dynamic) and shows a
// dismissible banner, then cleans the query string.

import { useEffect, useState } from "react";
import { CONNECTORS, isConnectorId } from "@/pixel-pilot";

type Kind = "ok" | "error";

const REASONS: Record<string, string> = {
  state: "security check failed — please try again",
  code: "no authorization code returned",
  unconfigured: "credentials aren't set for this connector yet",
  exchange: "the token exchange was rejected",
};

export function ConnectionBanner() {
  const [msg, setMsg] = useState<{ kind: Kind; text: string } | null>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const ok = p.get("connected");
    const err = p.get("connect_error");
    const id = ok || err;
    if (!id) return;

    const name = isConnectorId(id) ? CONNECTORS[id].name : id;
    if (ok) {
      setMsg({ kind: "ok", text: `${name} connected. Pixel Pilot has the controls.` });
    } else {
      const reason = p.get("reason");
      const tail = reason && REASONS[reason] ? ` — ${REASONS[reason]}` : "";
      setMsg({ kind: "error", text: `Couldn't connect ${name}${tail}.` });
    }

    // Clean the query string without a reload.
    const clean = window.location.pathname + window.location.hash;
    window.history.replaceState({}, "", clean);

    const t = setTimeout(() => setMsg(null), 7000);
    return () => clearTimeout(t);
  }, []);

  if (!msg) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] px-4 w-full max-w-md">
      <div
        className={`flex items-start gap-3 rounded-xl border px-4 py-3 backdrop-blur-xl shadow-lg ${
          msg.kind === "ok"
            ? "border-secondary/40 bg-secondary/10"
            : "border-error/40 bg-error/10"
        }`}
      >
        <span
          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
            msg.kind === "ok" ? "bg-secondary" : "bg-error"
          }`}
        />
        <p className="text-sm text-text-primary flex-1">{msg.text}</p>
        <button
          onClick={() => setMsg(null)}
          className="text-text-tertiary hover:text-text-primary transition text-sm leading-none"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
````
