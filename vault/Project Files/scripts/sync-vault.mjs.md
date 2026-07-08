---
tags: [pixel-pilot, source]
file: scripts/sync-vault.mjs
---

# `scripts/sync-vault.mjs`

Part of [[📁 Codebase]] — live copy at `~/Pixel-Pilot/scripts/sync-vault.mjs`

````js
#!/usr/bin/env node
// ─── PIXEL PILOT · VAULT SYNC ────────────────────────────────────────────────
// Mirrors the *entire* tracked codebase into the Obsidian vault under
// "vault/Project Files/", one note per source file, and regenerates the
// "📁 Codebase.md" index. Idempotent — run it any time the code changes:
//
//   node scripts/sync-vault.mjs
//
// It only touches Project Files/** and 📁 Codebase.md; the hand-written notes
// (Architecture, The Stack, etc.) are left alone.

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'vault', 'Project Files');

// Never mirror: the vault itself, deps, build output, lockfiles, binaries.
const SKIP_DIRS = ['vault/', 'node_modules/', 'out/', '.next/', '.git/'];
const SKIP_FILES = ['package-lock.json', 'tsconfig.tsbuildinfo'];
const BINARY = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.svg',
  '.mp4', '.mov', '.webm', '.woff', '.woff2', '.ttf', '.otf', '.pdf', '.mp3', '.wav',
]);

const LANG = {
  '.ts': 'ts', '.tsx': 'tsx', '.js': 'js', '.mjs': 'js', '.cjs': 'js',
  '.css': 'css', '.json': 'json', '.md': 'md', '.mdx': 'md',
  '.txt': 'text', '.html': 'html', '.yml': 'yaml', '.yaml': 'yaml',
};

// Tracked + new untracked files (respecting .gitignore) so freshly-created
// files are mirrored even before they're committed.
const tracked = execSync('git ls-files --cached --others --exclude-standard', { encoding: 'utf8' })
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean)
  .filter((f) => !SKIP_DIRS.some((d) => f.startsWith(d)))
  .filter((f) => !SKIP_FILES.includes(path.basename(f)))
  .filter((f) => !BINARY.has(path.extname(f).toLowerCase()))
  .sort();

// A code fence longer than the longest backtick-run in the content, min 4.
function fenceFor(content) {
  let longest = 0;
  for (const m of content.matchAll(/`+/g)) longest = Math.max(longest, m[0].length);
  return '`'.repeat(Math.max(4, longest + 1));
}

let written = 0;
for (const file of tracked) {
  const abs = path.join(ROOT, file);
  let content;
  try {
    content = fs.readFileSync(abs, 'utf8');
  } catch {
    continue; // unreadable / vanished
  }
  const ext = path.extname(file).toLowerCase();
  const lang = LANG[ext] ?? '';
  const fence = fenceFor(content);
  const note =
    `---\ntags: [pixel-pilot, source]\nfile: ${file}\n---\n\n` +
    `# \`${file}\`\n\n` +
    `Part of [[📁 Codebase]] — live copy at \`~/Pixel-Pilot/${file}\`\n\n` +
    `${fence}${lang}\n${content.replace(/\n$/, '')}\n${fence}\n`;

  const dest = path.join(OUT, `${file}.md`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, note);
  written++;
}

// Regenerate the codebase index note.
const tree = tracked.join('\n');
const index =
  `---\ntags: [pixel-pilot, source, moc]\n---\n\n` +
  `# 📁 Codebase\n\n` +
  `The complete Pixel Pilot repo, mirrored as notes under **Project Files/**. Back to [[🚀 Pixel Pilot — Home]].\n\n` +
  `> [!info] Source of truth\n` +
  `> Live repo \`GreenAiSolution/Pixel-Pilot-\` (local \`~/Pixel-Pilot\`). Snapshot — edit code in the repo, then run \`node scripts/sync-vault.mjs\` to refresh. \`package-lock.json\` and binaries omitted.\n\n` +
  `**${tracked.length} files** mirrored.\n\n` +
  `## File tree\n\n\`\`\`\n${tree}\n\`\`\`\n`;
fs.writeFileSync(path.join(ROOT, 'vault', '📁 Codebase.md'), index);

console.log(`Vault synced: ${written} source notes written under "Project Files/", index rebuilt (${tracked.length} files).`);
````
