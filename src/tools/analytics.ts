import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AyrshareClient } from "../client.js";
import { platformsSchema, profileKeySchema } from "../types.js";

export function registerAnalyticsTools(server: McpServer, client: AyrshareClient) {
  server.tool(
    "get_post_analytics",
    "Get engagement analytics for a specific post (likes, views, shares, impressions, comments). Returns real-time metrics across all platforms the post was published to. Note: TikTok/YouTube can take 24-48h to update. Requires Premium plan.",
    {
      id: z.string().describe("Ayrshare Post ID to get analytics for"),
      platforms: z
        .array(platformsSchema)
        .optional()
        .describe("Filter analytics by specific platforms (omit to get all)"),
      profileKey: profileKeySchema,
    },
    async (args) => {
      try {
        const result = await client.getPostAnalytics(args);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [
            { type: "text" as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "get_social_analytics",
    "Get account-level analytics for social profiles (follower count, demographics, impressions, engagement rates). Requires Premium plan.",
    {
      platforms: z
        .array(platformsSchema)
        .describe("Social platforms to get analytics for"),
      quarters: z
        .number()
        .optional()
        .describe("Historical data range 1-4 quarters (Facebook/Instagram/YouTube only)"),
      daily: z
        .boolean()
        .optional()
        .describe("Return daily time-series data (Facebook/Instagram/TikTok/YouTube)"),
      profileKey: profileKeySchema,
    },
    async (args) => {
      try {
        const result = await client.getSocialAnalytics(args);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [
            { type: "text" as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` },
          ],
          isError: true,
        };
      }
    },
  );
}
