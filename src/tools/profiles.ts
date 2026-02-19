import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AyrshareClient } from "../client.js";
import { platformsSchema } from "../types.js";

export function registerProfileTools(server: McpServer, client: AyrshareClient) {
  server.tool(
    "create_profile",
    "Create a new user profile for managing separate social media accounts. Returns the profile key needed for subsequent operations. Requires Business plan.",
    {
      title: z.string().describe("Unique profile name"),
      messagingActive: z
        .boolean()
        .optional()
        .describe("Enable messaging for this profile (default false)"),
      disableSocial: z
        .array(platformsSchema)
        .optional()
        .describe("Social networks to disable for this profile"),
      tags: z
        .array(z.string())
        .optional()
        .describe("Tags for organizing profiles"),
    },
    async (args) => {
      try {
        const result = await client.createProfile(args);
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
    "list_profiles",
    "List all user profiles with their linked social accounts. Supports filtering and pagination. Requires Business plan.",
    {
      title: z
        .string()
        .optional()
        .describe("Filter by profile title"),
      refId: z
        .string()
        .optional()
        .describe("Filter by reference ID"),
      hasActiveSocialAccounts: z
        .boolean()
        .optional()
        .describe("Filter profiles with/without connected social accounts"),
      limit: z
        .number()
        .optional()
        .describe("Maximum profiles to return (default 5000)"),
      cursor: z
        .string()
        .optional()
        .describe("Pagination cursor for next page of results"),
    },
    async (args) => {
      try {
        const result = await client.listProfiles(args);
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
    "update_profile",
    "Update an existing user profile's settings. Requires Business plan.",
    {
      profileKey: z.string().describe("Profile Key of the profile to update"),
      title: z.string().describe("New profile title (must be unique)"),
      disableSocial: z
        .array(platformsSchema)
        .optional()
        .describe("Social networks to disable"),
      messagingActive: z
        .boolean()
        .optional()
        .describe("Enable/disable messaging"),
      tags: z
        .array(z.string())
        .optional()
        .describe("Tags for organizing profiles"),
    },
    async (args) => {
      try {
        const result = await client.updateProfile(args);
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
