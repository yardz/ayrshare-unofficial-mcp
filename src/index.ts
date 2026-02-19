#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { AyrshareClient } from "./client.js";
import { registerPostTools } from "./tools/posts.js";
import { registerProfileTools } from "./tools/profiles.js";
import { registerMediaTools } from "./tools/media.js";
import { registerCommentTools } from "./tools/comments.js";
import { registerMessageTools } from "./tools/messages.js";
import { registerAnalyticsTools } from "./tools/analytics.js";
import { registerAutoScheduleTools } from "./tools/auto-schedule.js";

const apiKey = process.env.AYRSHARE_API_KEY;
if (!apiKey) {
  console.error("AYRSHARE_API_KEY environment variable is required");
  process.exit(1);
}

const profileKey = process.env.AYRSHARE_PROFILE_KEY;

const client = new AyrshareClient(apiKey, profileKey);

const server = new McpServer({
  name: "ayrshare-unofficial-mcp",
  version: "1.0.0",
});

registerPostTools(server, client);
registerProfileTools(server, client);
registerMediaTools(server, client);
registerCommentTools(server, client);
registerMessageTools(server, client);
registerAnalyticsTools(server, client);
registerAutoScheduleTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
