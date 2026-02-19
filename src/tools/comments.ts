import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AyrshareClient } from "../client.js";
import { commentPlatformsSchema, profileKeySchema } from "../types.js";

export function registerCommentTools(server: McpServer, client: AyrshareClient) {
  server.tool(
    "post_comment",
    "Post a comment on a social media post. Supports text and image comments across multiple platforms. Requires Premium plan.",
    {
      id: z.string().describe("Ayrshare Post ID or Social Post ID of the post to comment on"),
      comment: z.string().describe("Comment text content"),
      platforms: z
        .array(commentPlatformsSchema)
        .describe("Target platforms for the comment"),
      searchPlatformId: z
        .boolean()
        .optional()
        .describe("Set to true when using a Social Post ID instead of Ayrshare Post ID"),
      mediaUrls: z
        .array(z.string())
        .optional()
        .describe("Image URLs to attach to the comment"),
      profileKey: profileKeySchema,
    },
    async (args) => {
      try {
        const result = await client.postComment(args);
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
    "get_comments",
    "Get comments on a social media post. Can retrieve by Ayrshare Post ID, Social Post ID, or Social Comment ID. Requires Premium plan.",
    {
      id: z.string().describe("Ayrshare Post ID, Social Post ID, or Social Comment ID"),
      searchPlatformId: z
        .boolean()
        .optional()
        .describe("Set to true when using a Social Post ID or Social Comment ID"),
      commentId: z
        .boolean()
        .optional()
        .describe("Set to true when using a Social Comment ID"),
      platform: z
        .string()
        .optional()
        .describe("Required when searchPlatformId or commentId is true"),
      profileKey: profileKeySchema,
    },
    async (args) => {
      try {
        const result = await client.getComments(args);
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
    "delete_comment",
    "Delete a comment from a social media post. Uses the Social Comment ID from the platform. Supported on Facebook, Instagram, TikTok, X/Twitter, and YouTube. Requires Premium plan.",
    {
      id: z.string().describe("Social Comment ID to delete (get this from get_comments with searchPlatformId=true)"),
      platform: z
        .enum(["facebook", "instagram", "tiktok", "twitter", "youtube"])
        .describe("Platform where the comment exists"),
      profileKey: profileKeySchema,
    },
    async (args) => {
      try {
        const result = await client.deleteComment(args);
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
