---
tags: [phx-growth, source]
file: lib/cn.ts
---

# `lib/cn.ts`

Part of [[📁 Codebase]] — live copy at `~/PHX-Growth/lib/cn.ts`

````ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
````
