#!/usr/bin/env node
// Pixel Pilot (now PHX Growth) MCP server — exposes the real contents of this
// repository (the pixel-pilot/ engine, app routes, agent crew) as tools over
// the Model Context Protocol (stdio transport). No hardcoded/fake data — every
// tool parses the actual source files at call time.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

const SKIP_DIRS = new Set(['node_modules', '.git', '.next', '.vercel', 'mcp-server']);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function read(rel) {
  return readFileSync(join(REPO_ROOT, rel), 'utf8');
}

function json(data) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

// ── Tiny extractor for the repo's TS object-literal arrays/records ──────────
// Finds `NAME ... = [` or `NAME ... = {`, then splits the top-level object
// literals by brace depth. Field values are pulled with targeted regexes, so
// this reads straight off the real .ts source without needing a TS loader.
function extractObjectBlocks(source, marker) {
  const start = source.indexOf(marker);
  if (start === -1) return [];
  const eq = source.indexOf('=', start);
  if (eq === -1) return [];
  const bracket = source.indexOf('[', eq);
  const brace = source.indexOf('{', eq);
  const open = bracket !== -1 && (brace === -1 || bracket < brace) ? bracket : brace;
  if (open === -1) return [];
  const blocks = [];
  let depth = 0;
  let blockStart = -1;
  for (let i = open + 1; i < source.length; i++) {
    const ch = source[i];
    if (ch === '{') {
      if (depth === 0) blockStart = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && blockStart !== -1) {
        blocks.push(source.slice(blockStart, i + 1));
        blockStart = -1;
      }
      if (depth < 0) break;
    } else if (depth === 0 && (ch === ']' || (ch === ';' && blocks.length))) {
      break;
    }
  }
  return blocks;
}

function field(block, key) {
  const m = block.match(new RegExp(`\\b${key}:\\s*(?:'((?:[^'\\\\]|\\\\.)*)'|"((?:[^"\\\\]|\\\\.)*)"|([\\d.]+))`));
  if (!m) return undefined;
  const raw = m[1] ?? m[2] ?? m[3];
  if (m[3] !== undefined) return Number(m[3]);
  return raw.replace(/\\'/g, "'").replace(/\\"/g, '"');
}

function stringArray(block, key) {
  const m = block.match(new RegExp(`\\b${key}:\\s*\\[([\\s\\S]*?)\\]`));
  if (!m) return [];
  return [...m[1].matchAll(/'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g)].map(
    (x) => (x[1] ?? x[2]).replace(/\\'/g, "'"),
  );
}

// ── Server ──────────────────────────────────────────────────────────────────
const server = new McpServer({ name: 'pixel-pilot', version: '1.0.0' });

server.registerTool(
  'get_services',
  {
    title: 'Get Pixel Pilot services',
    description:
      "Parse pixel-pilot/services.ts and return the real SERVICES array: id, flight number, name, category, headline, edge (the proof line), hero metric, and the live tool endpoint each service maps to.",
    inputSchema: {},
  },
  async () => {
    const src = read('pixel-pilot/services.ts');
    const services = extractObjectBlocks(src, 'SERVICES').map((b) => ({
      id: field(b, 'id'),
      no: field(b, 'no'),
      name: field(b, 'name'),
      category: field(b, 'category'),
      headline: field(b, 'headline'),
      edge: field(b, 'edge'),
      metricValue: field(b, 'value'),
      metricLabel: field(b, 'label'),
      tool: field(b, 'tool'),
    }));
    return json({ services });
  },
);

server.registerTool(
  'get_pricing',
  {
    title: 'Get pricing tiers',
    description:
      'Parse pixel-pilot/pricing.ts and return the real TIERS array: id, name, monthly retainer, performance component, tagline, who it is for, managed ad-spend ceiling, and what is included.',
    inputSchema: {},
  },
  async () => {
    const src = read('pixel-pilot/pricing.ts');
    const tiers = extractObjectBlocks(src, 'TIERS').map((b) => ({
      id: field(b, 'id'),
      name: field(b, 'name'),
      price: field(b, 'price'),
      performance: field(b, 'performance'),
      tagline: field(b, 'tagline'),
      forWho: field(b, 'forWho'),
      adSpend: field(b, 'adSpend'),
      includes: stringArray(b, 'includes'),
      featured: /featured:\s*true/.test(b),
    }));
    return json({ tiers });
  },
);

server.registerTool(
  'get_connectors',
  {
    title: 'Get ad-platform connectors',
    description:
      'Parse pixel-pilot/connectors.ts and return the real CONNECTORS registry: the 4 platforms (Meta Ads, Google Ads, TikTok Ads, Shopify), what each connector does once live, and the env var names its OAuth credentials are read from (never the secrets themselves).',
    inputSchema: {},
  },
  async () => {
    const src = read('pixel-pilot/connectors.ts');
    const connectors = extractObjectBlocks(src, 'CONNECTORS').map((b) => ({
      id: field(b, 'id'),
      name: field(b, 'name'),
      category: field(b, 'category'),
      tagline: field(b, 'tagline'),
      powers: stringArray(b, 'powers'),
      clientIdEnv: field(b, 'clientIdEnv'),
      clientSecretEnv: field(b, 'clientSecretEnv'),
    }));
    return json({ connectors });
  },
);

server.registerTool(
  'get_agent_crew',
  {
    title: 'Get the autonomous agent crew',
    description:
      'Parse pixel-pilot/agents.ts and return the real PIXEL_AGENTS roster: each operator\'s id, name, role, domain, callsign, the Claude subagent command it maps to, its cadence, and the workflows/integrations it owns.',
    inputSchema: {},
  },
  async () => {
    const src = read('pixel-pilot/agents.ts');
    const agents = extractObjectBlocks(src, 'PIXEL_AGENTS').map((b) => ({
      id: field(b, 'id'),
      name: field(b, 'name'),
      role: field(b, 'role'),
      domain: field(b, 'domain'),
      callsign: field(b, 'callsign'),
      command: field(b, 'command'),
      tagline: field(b, 'tagline'),
      cadence: field(b, 'cadence'),
      workflows: stringArray(b, 'workflows'),
      integrations: stringArray(b, 'integrations'),
    }));
    return json({ agents });
  },
);

server.registerTool(
  'list_routes',
  {
    title: 'List app routes',
    description:
      'Walk the Next.js app/ directory and return every page route and API route, derived from the real filesystem (route groups stripped).',
    inputSchema: {},
  },
  async () => {
    const files = walk(join(REPO_ROOT, 'app'));
    const pages = [];
    const api = [];
    for (const f of files) {
      const rel = relative(join(REPO_ROOT, 'app'), f).split(sep).join('/');
      if (/\/?page\.tsx?$/.test(rel)) {
        const route = '/' + rel.replace(/\/?page\.tsx?$/, '').replace(/\([^)]*\)\//g, '').replace(/\([^)]*\)$/, '');
        pages.push(route === '/' ? '/' : route.replace(/\/$/, ''));
      } else if (/\/?route\.tsx?$/.test(rel)) {
        const route = '/' + rel.replace(/\/?route\.tsx?$/, '').replace(/\/$/, '');
        const src = readFileSync(f, 'utf8');
        const methods = [...src.matchAll(/export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS)/g)].map((m) => m[1]);
        api.push({ route, methods: methods.length ? methods : ['(handler re-export)'] });
      }
    }
    return json({ pages: pages.sort(), apiRoutes: api.sort((a, b) => a.route.localeCompare(b.route)) });
  },
);

server.registerTool(
  'search_code',
  {
    title: 'Search code',
    description:
      'Regex search across all tracked source files in the repository (node_modules, .git, .next excluded). Returns file, line number, and the matching line. Case-insensitive by default.',
    inputSchema: {
      pattern: z.string().describe('JavaScript regular expression to search for'),
      caseSensitive: z.boolean().optional().describe('Match case-sensitively (default false)'),
      maxResults: z.number().int().min(1).max(500).optional().describe('Cap on returned matches (default 100)'),
    },
  },
  async ({ pattern, caseSensitive, maxResults }) => {
    const re = new RegExp(pattern, caseSensitive ? '' : 'i');
    const cap = maxResults ?? 100;
    const results = [];
    const files = walk(REPO_ROOT).filter((f) =>
      /\.(ts|tsx|js|mjs|json|md)$/.test(f) && !f.endsWith('package-lock.json'),
    );
    for (const f of files) {
      const lines = readFileSync(f, 'utf8').split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (re.test(lines[i])) {
          results.push({ file: relative(REPO_ROOT, f), line: i + 1, text: lines[i].trim().slice(0, 300) });
          if (results.length >= cap) return json({ matches: results, truncated: true });
        }
      }
    }
    return json({ matches: results, truncated: false });
  },
);

server.registerTool(
  'read_file',
  {
    title: 'Read repository file',
    description:
      'Read a file from the repository by path relative to the repo root (e.g. "pixel-pilot/services.ts"). Refuses paths outside the repo.',
    inputSchema: {
      path: z.string().describe('Path relative to the repository root'),
    },
  },
  async ({ path }) => {
    if (path.includes('..')) throw new Error('Path traversal is not allowed');
    const text = read(path);
    return { content: [{ type: 'text', text: text.length > 100_000 ? text.slice(0, 100_000) + '\n…(truncated)' : text }] };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
