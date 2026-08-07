---
tags: [phx-growth, source]
file: app/(marketing)/layout.tsx
---

# `app/(marketing)/layout.tsx`

Part of [[📁 Codebase]] — live copy at `~/PHX-Growth/app/(marketing)/layout.tsx`

**Imports** [[Project Files/components/phx-growth/shell.tsx|shell.tsx]]

````tsx
import { Shell } from '@/components/phx-growth/shell';

// PHX Growth marketing chrome (nav, footer, 3D flight scene). Scoped to this
// route group so sibling apps (e.g. /eagle) can render their own chrome.
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}
````
