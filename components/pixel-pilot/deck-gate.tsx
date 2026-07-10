"use client";

// ─── PIXEL PILOT · DECK GATE ─────────────────────────────────────────────────
// The lock screen for /deck/*. Exchanges the operator key for the httpOnly
// deck cookie via /api/pixel-pilot/deck/auth, then reloads into the deck.

import { useState } from "react";

const GRAD = "linear-gradient(90deg,#00D4FF,#6C63FF,#FF2E9A)";

export function DeckGate({ locked }: { locked?: boolean }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!key.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/pixel-pilot/deck/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key.trim() }),
      });
      const data = await res.json();
      if (data.ok) window.location.reload();
      else setError(data.error ?? "Wrong key.");
    } catch {
      setError("Network hiccup — try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-32 flex justify-center">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-10 backdrop-blur-md text-center space-y-5">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[120%] -translate-x-1/2 opacity-20 blur-3xl"
          style={{ background: GRAD }}
          aria-hidden
        />
        <div className="relative space-y-2">
          <div className="text-xs uppercase tracking-[0.35em] text-text-tertiary">Operator Deck</div>
          <h1 className="text-2xl font-semibold">Owners only past this point</h1>
          <p className="text-sm text-text-secondary">
            {locked
              ? "The deck is locked and no operator key is configured. Set PP_DECK_KEY in the environment, then return."
              : "Enter the operator key to open Client Command."}
          </p>
        </div>
        {!locked && (
          <div className="relative space-y-3">
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Operator key"
              autoFocus
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-center tracking-widest placeholder:text-text-tertiary focus:border-white/30 focus:outline-none transition"
            />
            <button
              onClick={submit}
              disabled={busy || !key.trim()}
              className="w-full rounded-full px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
              style={{ background: GRAD }}
            >
              {busy ? "Verifying…" : "Open the deck →"}
            </button>
            {error && <div className="text-sm text-red-400">{error}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
