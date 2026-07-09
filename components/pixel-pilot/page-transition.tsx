"use client";

// ─── PIXEL PILOT · PAGE TRANSITIONS ──────────────────────────────────────────
// A branded "flight sweep" that fires on every route change: a gradient runway
// wipes across the viewport, the wordmark pulses, and the incoming page glides
// up into place. Respects prefers-reduced-motion (no wipe, instant content).
// Wired once in the Shell so every landing feels like the pilot banking onto a
// new runway — the connective tissue of the whole Pixel Pilot niche.

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const GRADIENT = "linear-gradient(90deg,#00D4FF 0%,#6C63FF 45%,#FF2E9A 100%)";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sweeping, setSweeping] = useState(false);
  const [contentKey, setContentKey] = useState(pathname);
  const first = useRef(true);

  useEffect(() => {
    // Skip the very first paint — contentKey already equals pathname, so only
    // real navigations animate. All state updates are deferred (rAF/timeout) so
    // nothing mutates synchronously inside the effect body.
    if (first.current) {
      first.current = false;
      return;
    }

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      const id = requestAnimationFrame(() => {
        setContentKey(pathname);
        window.scrollTo(0, 0);
      });
      return () => cancelAnimationFrame(id);
    }

    // Fire the runway sweep, swap the content mid-wipe, then clear.
    const start = requestAnimationFrame(() => setSweeping(true));
    const swap = window.setTimeout(() => {
      setContentKey(pathname);
      window.scrollTo(0, 0);
    }, 320);
    const clear = window.setTimeout(() => setSweeping(false), 720);

    return () => {
      cancelAnimationFrame(start);
      window.clearTimeout(swap);
      window.clearTimeout(clear);
    };
  }, [pathname]);

  return (
    <>
      {/* Runway sweep overlay */}
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 z-[100] overflow-hidden ${
          sweeping ? "" : "hidden"
        }`}
      >
        <div className="pp-sweep absolute inset-y-0 -left-1/3 w-[160%]" style={{ background: GRADIENT }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="pp-sweep-mark text-2xl font-semibold uppercase tracking-[0.35em] text-white/95">
              Pixel<span className="text-black/70">/Pilot</span>
            </span>
          </div>
        </div>
      </div>

      {/* Incoming page — re-keyed per route so it re-mounts and glides in */}
      <div key={contentKey} className="pp-page-in">
        {children}
      </div>
    </>
  );
}
