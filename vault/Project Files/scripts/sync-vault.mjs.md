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
const all = execSync('git -c core.quotepath=false ls-files --cached --others --exclude-standard', { encoding: 'utf8' })
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean)
  .filter((f) => !SKIP_DIRS.some((d) => f.startsWith(d)))
  .filter((f) => !SKIP_FILES.includes(path.basename(f)))
  .sort();
const tracked = all.filter((f) => !BINARY.has(path.extname(f).toLowerCase()));
// Media stays out of the repo vault (keeps git lean) but is copied raw into
// the Obsidian vault below, where it previews inline.
const media = all.filter((f) => BINARY.has(path.extname(f).toLowerCase()));

// A code fence longer than the longest backtick-run in the content, min 4.
function fenceFor(content) {
  let longest = 0;
  for (const m of content.matchAll(/`+/g)) longest = Math.max(longest, m[0].length);
  return '`'.repeat(Math.max(4, longest + 1));
}

// The set of files that have notes — a link target must be in here.
const mirrorSet = new Set(tracked);
const RESOLVE_EXT = ['', '.ts', '.tsx', '.js', '.mjs', '.cjs', '.css', '.json', '/index.ts', '/index.tsx', '/index.js'];

/** Resolve an import specifier from `file` to a mirrored repo path, or null. */
function resolveImport(file, spec) {
  let base;
  if (spec.startsWith('@/')) base = spec.slice(2);
  else if (spec.startsWith('.')) base = path.posix.normalize(path.posix.join(path.posix.dirname(file), spec));
  else return null; // bare module (node_modules) — not mirrored
  for (const ext of RESOLVE_EXT) {
    const cand = `${base}${ext}`;
    if (mirrorSet.has(cand)) return cand;
  }
  return null;
}

/** The mirrored files that `file` imports — powers the dependency graph. */
function importsFor(file, content) {
  const found = new Set();
  const re = /(?:import|export)[^'"]*?from\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;
  for (const m of content.matchAll(re)) {
    const target = resolveImport(file, m[1] || m[2]);
    if (target && target !== file) found.add(target);
  }
  return [...found].sort();
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
  const deps = importsFor(file, content);
  const depsLine = deps.length
    ? `**Imports** ${deps.map((d) => `[[Project Files/${d}|${path.basename(d)}]]`).join(' · ')}\n\n`
    : '';
  const note =
    `---\ntags: [pixel-pilot, source]\nfile: ${file}\n---\n\n` +
    `# \`${file}\`\n\n` +
    `Part of [[📁 Codebase]] — live copy at \`~/Pixel-Pilot/${file}\`\n\n` +
    depsLine +
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
  `> Live repo \`GreenAiSolution/Pixel-Pilot-\` (local \`~/Pixel-Pilot\`). Snapshot — edit code in the repo, then run \`node scripts/sync-vault.mjs\` to refresh. \`package-lock.json\` omitted; images/video are attached raw in the Obsidian copy.\n\n` +
  `**${tracked.length} files** mirrored.\n\n` +
  `## File tree\n\n\`\`\`\n${tree}\n\`\`\`\n`;
fs.writeFileSync(path.join(ROOT, 'vault', '📁 Codebase.md'), index);

console.log(`Vault synced: ${written} source notes written under "Project Files/", index rebuilt (${tracked.length} files).`);

// ─── Mirror into the real Obsidian vault ─────────────────────────────────────
// The repo's vault/ is the source of truth; the user's actual Obsidian vault
// lives in ~/Documents. Generated content (Project Files/, 📁 Codebase.md) is
// force-mirrored with stale-file cleanup; hand-written notes are copied only
// when missing so edits made inside Obsidian are never overwritten.
const OBSIDIAN = path.join(
  process.env.HOME, 'Documents', 'Obsidian Vault', 'Pixel Pilot',
);
if (fs.existsSync(path.dirname(OBSIDIAN))) {
  const destFiles = path.join(OBSIDIAN, 'Project Files');
  fs.rmSync(destFiles, { recursive: true, force: true });
  fs.cpSync(OUT, destFiles, { recursive: true });
  fs.copyFileSync(
    path.join(ROOT, 'vault', '📁 Codebase.md'),
    path.join(OBSIDIAN, '📁 Codebase.md'),
  );
  let copiedNotes = 0;
  for (const entry of fs.readdirSync(path.join(ROOT, 'vault'))) {
    if (entry === 'Project Files' || entry === '📁 Codebase.md') continue;
    const dest = path.join(OBSIDIAN, entry);
    if (!fs.existsSync(dest)) {
      fs.cpSync(path.join(ROOT, 'vault', entry), dest, { recursive: true });
      copiedNotes++;
    }
  }
  let copiedMedia = 0;
  for (const file of media) {
    const dest = path.join(destFiles, file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(ROOT, file), dest);
    copiedMedia++;
  }
  console.log(
    `Obsidian synced: "${OBSIDIAN}" — Project Files mirrored, ` +
    `${copiedMedia} media files attached, ${copiedNotes} new notes copied.`,
  );
} else {
  console.log('Obsidian vault not found in ~/Documents — skipped the Obsidian mirror.');
}
````
