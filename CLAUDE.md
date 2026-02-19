# CLAUDE.md

## Project Overview

Unofficial MCP (Model Context Protocol) server for the Ayrshare social media API. This server executes real API calls, allowing AI agents to manage social media accounts directly.

## Tech Stack

- **TypeScript (ESM)** — `"type": "module"` in package.json
- **@modelcontextprotocol/sdk** — MCP server framework
- **Zod** — Schema validation for tool parameters
- **Native fetch** — No axios/node-fetch (requires Node.js >= 18)
- **StdioServerTransport** — Communication via stdin/stdout

## Commands

- `npm run build` — Compile TypeScript to `build/`
- `npm run dev` — Watch mode compilation
- `npm start` — Run the built server
- `npx @modelcontextprotocol/inspector node build/index.js` — Test tools interactively

## Architecture

```
src/
├── index.ts         — Entry point: creates McpServer, registers all tools, starts stdio transport
├── client.ts        — AyrshareClient class: wraps all HTTP calls to https://api.ayrshare.com/api
├── types.ts         — Shared Zod schemas (platform enums, profileKey schema)
└── tools/
    ├── posts.ts          — create_post, get_post, get_post_history, delete_post
    ├── profiles.ts       — create_profile, list_profiles, update_profile (NO delete — too dangerous)
    ├── media.ts          — upload_media (accepts URL or base64)
    ├── comments.ts       — post_comment, get_comments, delete_comment
    ├── messages.ts       — send_message, get_messages
    ├── analytics.ts      — get_post_analytics, get_social_analytics
    └── auto-schedule.ts  — set_auto_schedule, list_auto_schedules, delete_auto_schedule
```

## Key Patterns

### Tool Registration Pattern
Each `src/tools/*.ts` file exports a `register*Tools(server, client)` function that registers tools using `server.tool(name, description, zodSchema, handler)`. All handlers follow the same pattern:
- Try/catch wrapping the client call
- Return `{ content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }` on success
- Return `{ content: [...], isError: true }` on error

### AyrshareClient (`src/client.ts`)
- Central HTTP wrapper — all API calls go through `this.request(method, path, body?, profileKey?, query?)`
- Auth: `Authorization: Bearer API_KEY` header on every request
- Optional `Profile-Key` header per-call for multi-profile support
- 18 methods, one per API endpoint

### Configuration
- `AYRSHARE_API_KEY` (required) — read from `process.env` at startup
- `AYRSHARE_PROFILE_KEY` (optional) — default profile key
- No `.env` file handling (no dotenv) — users set env vars via MCP client config

## Design Decisions

- **No `delete_profile` tool** — Irreversible operation, too dangerous for AI agents
- **Everything that can be created can be deleted** (except profiles) — posts, comments, auto-schedules
- **`profileKey` optional on every tool** — Allows operating on different profiles per-call
- **Media upload accepts URL or base64** — Since MCP tools can't pass binary data, the server downloads from URL and re-uploads as base64
- **Native fetch only** — Keeps dependencies minimal (only MCP SDK + Zod)
- **All imports use `.js` extension** — Required by NodeNext module resolution

## Adding a New Tool

1. Add the HTTP method to `src/client.ts`
2. Create or edit the appropriate `src/tools/*.ts` file
3. Use the existing pattern: Zod schema for params, try/catch handler, JSON.stringify response
4. Register the tool in `src/index.ts` if it's a new tool file
5. Run `npm run build` to verify compilation
6. Update `README.md` with the new tool documentation

## Ayrshare API Reference

- Base URL: `https://api.ayrshare.com/api`
- Auth: Bearer token in `Authorization` header
- Docs: https://www.ayrshare.com/docs/apis
- Supported platforms: Bluesky, Facebook, GMB, Instagram, LinkedIn, Pinterest, Reddit, Snapchat, Telegram, Threads, TikTok, Twitter/X, YouTube
