import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AyrshareClient } from "../client.js";
import { profileKeySchema } from "../types.js";

export function registerMediaTools(server: McpServer, client: AyrshareClient) {
  server.tool(
    "upload_media",
    "Upload an image or video to Ayrshare's media library. Accepts either a public URL (which will be downloaded and uploaded) or base64-encoded data. Files are stored for 90 days. Max 30MB. Requires Premium plan.",
    {
      fileUrl: z
        .string()
        .optional()
        .describe("Public URL of the file to upload. The server will download and re-upload it. One of fileUrl or base64Data is required."),
      base64Data: z
        .string()
        .optional()
        .describe("Base64-encoded file data with data URI prefix (e.g. 'data:image/png;base64,...'). One of fileUrl or base64Data is required."),
      fileName: z
        .string()
        .optional()
        .describe("Name for the uploaded file"),
      description: z
        .string()
        .optional()
        .describe("File description"),
      profileKey: profileKeySchema,
    },
    async (args) => {
      try {
        if (!args.fileUrl && !args.base64Data) {
          return {
            content: [
              { type: "text" as const, text: "Error: Either fileUrl or base64Data must be provided" },
            ],
            isError: true,
          };
        }
        const result = await client.uploadMedia(args);
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
