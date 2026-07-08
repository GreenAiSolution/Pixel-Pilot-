---
tags: [pixel-pilot, source]
file: app/eagle/layout.tsx
---

# `app/eagle/layout.tsx`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/app/eagle/layout.tsx`

````tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { EAGLE } from '@/eagle';

export const metadata: Metadata = {
  title: 'Eagle Landscaping — Landscapes worth landing on',
  description:
    'Full-service landscaping: lawn care, design & install, hardscaping, irrigation, cleanups and snow removal. Fast quotes, reliable crews, clean billing.',
};

const NAV = [
  { href: '/eagle#services', label: 'Services' },
  { href: '/eagle#work', label: 'Our Work' },
  { href: '/eagle#reviews', label: 'Reviews' },
  { href: '/eagle/ops', label: 'Ops' },
];

export default function EagleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-[#14261A] antialiased" style={{ colorScheme: 'light' }}>
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/85 backdrop-blur-md">
        <nav className="mx-auto max-w-6xl px-6 py-3.5 flex items-center justify-between">
          <Link href="/eagle" className="flex items-center gap-2.5">
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-lg"
              style={{ background: EAGLE.forest, color: 'white' }}
            >
              🦅
            </span>
            <span className="font-semibold text-lg tracking-tight" style={{ color: EAGLE.ink }}>
              Eagle <span style={{ color: EAGLE.forest }}>Landscaping</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {NAV.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-[#14261A]/70 hover:text-[#14261A] hover:bg-[#EAF4EC] transition"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <a
            href="/eagle#quote"
            className="rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: EAGLE.forest }}
          >
            Get a free quote
          </a>
        </nav>
      </header>

      <main>{children}</main>

      <footer className="mt-24 border-t border-black/5 bg-[#0F1A12] text-white/80">
        <div className="mx-auto max-w-6xl px-6 py-12 grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 text-white font-semibold text-lg">
              <span>🦅</span> Eagle Landscaping
            </div>
            <p className="mt-2 text-sm text-white/60 max-w-xs">{EAGLE.promise}</p>
          </div>
          <div className="text-sm space-y-1.5">
            <div className="text-white/50 uppercase tracking-widest text-xs mb-2">Contact</div>
            <div>{EAGLE.phone}</div>
            <div>{EAGLE.email}</div>
            <div>{EAGLE.hours}</div>
          </div>
          <div className="text-sm space-y-1.5">
            <div className="text-white/50 uppercase tracking-widest text-xs mb-2">Service area</div>
            <div>{EAGLE.serviceArea}</div>
            <div className="pt-2 text-white/40 text-xs">
              Run by Eagle Ops · 5 AI employees · powered by Green AI Solution
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
````
