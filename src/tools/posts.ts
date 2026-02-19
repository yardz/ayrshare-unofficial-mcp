import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AyrshareClient } from "../client.js";
import { platformsSchema, profileKeySchema } from "../types.js";

export function registerPostTools(server: McpServer, client: AyrshareClient) {
  server.tool(
    "create_post",
    "Publish or schedule a social media post to one or more platforms. Supports text, images, videos, scheduling, and auto-scheduling.",
    {
      post: z.string().describe("The text content of the post. Can be empty string if mediaUrls are provided."),
      platforms: z
        .array(platformsSchema)
        .describe("Target social platforms to publish to"),
      mediaUrls: z
        .array(z.string())
        .optional()
        .describe("HTTPS URLs of images or videos to attach"),
      scheduleDate: z
        .string()
        .optional()
        .describe("ISO 8601 UTC datetime for scheduling (e.g. 2026-03-01T10:00:00Z)"),
      shortenLinks: z
        .boolean()
        .optional()
        .describe("Enable link shortening (requires Max Pack)"),
      requiresApproval: z
        .boolean()
        .optional()
        .describe("Put post in approval workflow before publishing"),
      notes: z
        .string()
        .optional()
        .describe("Internal reference notes (retrieved via get_post_history)"),
      autoSchedule: z
        .object({
          schedule: z.boolean().describe("Must be true to enable auto-scheduling"),
          title: z
            .string()
            .optional()
            .describe("Schedule name to use (case-sensitive, defaults to 'default')"),
        })
        .optional()
        .describe("Use auto-schedule instead of scheduleDate. Post goes to next available slot."),
      profileKey: profileKeySchema,
    },
    async (args) => {
      try {
        const result = await client.createPost(args);
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
    "get_post",
    "Get details of a specific post by its Ayrshare Post ID. Returns status, content, platform-specific post IDs and URLs.",
    {
      id: z.string().describe("The Ayrshare Post ID"),
      profileKey: profileKeySchema,
    },
    async (args) => {
      try {
        const result = await client.getPost(args.id, args.profileKey);
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
    "get_post_history",
    "List post history with optional filters. Returns posts with their status, content, platforms, and scheduling info.",
    {
      limit: z
        .number()
        .optional()
        .describe("Number of posts to return (default 25, max 1000)"),
      platforms: z
        .array(platformsSchema)
        .optional()
        .describe("Filter by specific platforms"),
      status: z
        .enum(["success", "error", "processing", "pending", "paused", "deleted", "awaiting approval"])
        .optional()
        .describe("Filter by post status"),
      type: z
        .enum(["immediate", "scheduled"])
        .optional()
        .describe("Filter by post type"),
      lastDays: z
        .number()
        .optional()
        .describe("Return last N days of posts (default 30, 0 = all)"),
      profileKey: profileKeySchema,
    },
    async (args) => {
      try {
        const result = await client.getPostHistory(args);
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
    "delete_post",
    "Delete a post from social platforms. Can delete a single post, multiple posts in bulk, or all scheduled posts.",
    {
      id: z
        .string()
        .optional()
        .describe("Ayrshare Post ID to delete (required if not using bulk or deleteAllScheduled)"),
      bulk: z
        .array(z.string())
        .optional()
        .describe("Array of Ayrshare Post IDs for bulk deletion"),
      deleteAllScheduled: z
        .boolean()
        .optional()
        .describe("If true, deletes all pending scheduled posts"),
      profileKey: profileKeySchema,
    },
    async (args) => {
      try {
        const result = await client.deletePost(args);
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
