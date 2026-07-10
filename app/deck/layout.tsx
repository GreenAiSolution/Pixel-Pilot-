// ─── PIXEL PILOT · OPERATOR DECK LAYOUT ──────────────────────────────────────
// Private chrome for business-owner surfaces (/deck/*). No marketing nav, no
// footer links, noindex — this is the cockpit, not the brochure.

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Operator Deck — Pixel Pilot',
  robots: { index: false, follow: false },
};

const GRAD = 'linear-gradient(90deg,#00D4FF,#6C63FF,#FF2E9A)';

export default function DeckLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#05060f] text-text-primary flex flex-col">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#05060f]/70 backdrop-blur-xl">
        <nav className="container mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="relative inline-flex h-7 w-7 items-center justify-center">
              <span className="absolute inset-0 rounded-md opacity-90 blur-[6px]" style={{ background: GRAD }} />
              <span className="relative inline-block h-2.5 w-2.5 rotate-45 bg-white" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-[0.18em] uppercase">
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRAD }}>
                  Pixel
                </span>
                /Pilot
              </div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-text-tertiary">Operator Deck · Owners Only</div>
            </div>
          </div>
          <Link
            href="/"
            className="rounded-full border border-white/10 px-4 py-1.5 text-xs uppercase tracking-widest text-text-secondary hover:text-text-primary transition"
          >
            ← Public site
          </Link>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
