---
tags: [pixel-pilot, source]
file: eslint.config.mjs
---

# `eslint.config.mjs`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/eslint.config.mjs`

````js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
````
