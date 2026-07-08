---
tags: [pixel-pilot, source]
file: lib/cn.ts
---

# `lib/cn.ts`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/lib/cn.ts`

`````ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

`````
