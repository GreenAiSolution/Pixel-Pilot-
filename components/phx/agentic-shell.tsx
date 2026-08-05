"use client";

// Nav and footer for PHX Growth Agentic. Deliberately thin — the console is the
// page, and chrome that competes with it is chrome that has to go.

import type { ReactNode } from "react";
import Link from "next/link";

export function AgenticShell({ children }: { children: ReactNode }) {
  return (
    <div className="ag-root">
      {/* Faint scanline + vignette: the console glow, not a gradient wash. */}
      <div className="ag-atmos" aria-hidden />

      <header className="ag-nav">
        <div className="ag-shell ag-nav__inner">
          <Link href="/" className="ag-mark" aria-label="PHX Growth Agentic — home">
            <span className="ag-mark__name">PHX GROWTH</span>
            <span className="ag-mono ag-mark__suffix">AGENTIC</span>
          </Link>
          <nav className="ag-nav__links">
            <Link href="/employees">Employees</Link>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/report">The report</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/build">Build one</Link>
            <Link href="/book" className="ag-btn ag-btn--solid ag-btn--sm">
              Book 15 min
            </Link>
          </nav>
        </div>
      </header>

      <main className="ag-main">{children}</main>

      <footer className="ag-foot">
        <div className="ag-shell ag-foot__inner">
          <div>
            <div className="ag-mark__name ag-foot__name">PHX GROWTH</div>
            <p className="ag-foot__blurb">
              An AI employee on your line. Phoenix, Arizona.
            </p>
          </div>
          <nav className="ag-foot__links">
            <Link href="/employees">Employees</Link>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/report">The report</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/build">Build one</Link>
            <Link href="/book">Book a call</Link>
          </nav>
          <div className="ag-mono ag-foot__meta">© 2026</div>
        </div>
      </footer>
    </div>
  );
}
