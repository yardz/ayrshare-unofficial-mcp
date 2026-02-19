import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AyrshareClient } from "../client.js";
import { messagingPlatformsSchema, profileKeySchema } from "../types.js";

export function registerMessageTools(server: McpServer, client: AyrshareClient) {
  server.tool(
    "send_message",
    "Send a direct message on a social platform. Supports text and media messages on Facebook, Instagram, and X/Twitter. Requires Business plan.",
    {
      platform: messagingPlatformsSchema.describe("Target platform: facebook, instagram, or twitter"),
      recipientId: z.string().describe("Recipient's platform user ID"),
      message: z.string().describe("Message text (can be empty for Facebook/Instagram if mediaUrls provided)"),
      mediaUrls: z
        .array(z.string())
        .optional()
        .describe("Image, video, or voice file URLs to attach"),
      profileKey: profileKeySchema,
    },
    async (args) => {
      try {
        const result = await client.sendMessage(args);
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
    "get_messages",
    "Get messages and conversations from a social platform. Supports listing all conversations or getting a specific conversation's messages. Requires Business plan.",
    {
      platform: messagingPlatformsSchema.describe("Platform: facebook, instagram, or twitter"),
      status: z
        .enum(["active", "archived"])
        .optional()
        .describe("Conversation status filter (default: active)"),
      conversationId: z
        .string()
        .optional()
        .describe("Get a specific conversation by ID"),
      conversationsOnly: z
        .boolean()
        .optional()
        .describe("If true, returns only conversation list without messages (default: false)"),
      profileKey: profileKeySchema,
    },
    async (args) => {
      try {
        const result = await client.getMessages(args);
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
