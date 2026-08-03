# pixel-pilot--mcp

A [Model Context Protocol](https://modelcontextprotocol.io) stdio server that exposes this
repository — the Pixel Pilot (now PHX Growth) platform — to AI assistants. Every tool parses
the real `.ts` source files at call time; nothing is hardcoded or stubbed.

## Tools

| Tool | Input | What it returns |
|---|---|---|
| `get_services` | — | The real `SERVICES` array from `pixel-pilot/services.ts`: id, flight number, name, category, headline, edge line, hero metric, live tool endpoint |
| `get_pricing` | — | The real `TIERS` array from `pixel-pilot/pricing.ts`: id, name, retainer price, performance component, tagline, who it's for, managed ad-spend ceiling, what's included |
| `get_connectors` | — | The real `CONNECTORS` registry from `pixel-pilot/connectors.ts`: the 4 ad/commerce platforms, what each does once live, and the env var names (never secret values) their OAuth credentials come from |
| `get_agent_crew` | — | The real `PIXEL_AGENTS` roster from `pixel-pilot/agents.ts`: each operator's id, name, role, domain, callsign, Claude subagent command, cadence, workflows, integrations |
| `list_routes` | — | Every Next.js page route and API route found under `app/`, with HTTP methods for API routes |
| `search_code` | `pattern`, `caseSensitive?`, `maxResults?` | Regex search across all tracked source files — file, line, matched text |
| `read_file` | `path` | Contents of any file in the repo, given a path relative to the repo root |

## Setup

```bash
cd mcp-server
npm install
```

Register with Claude Code:

```bash
claude mcp add pixel-pilot -- node mcp-server/server.mjs
```

Or run it directly for testing:

```bash
npm start
```

## Smoke test

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"smoke","version":"0"}}}' | node server.mjs
```

should print an `initialize` result with the server name `pixel-pilot`.
