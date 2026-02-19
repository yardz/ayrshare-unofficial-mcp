import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AyrshareClient } from "../client.js";
import { profileKeySchema } from "../types.js";

export function registerAutoScheduleTools(server: McpServer, client: AyrshareClient) {
  server.tool(
    "set_auto_schedule",
    "Create or update an auto-posting schedule with predefined times and days. Posts created with autoSchedule enabled will be queued to the next available time slot. Requires Premium plan.",
    {
      schedule: z
        .array(z.string())
        .describe("Array of times in UTC format (e.g. ['09:00Z', '14:00Z', '18:00Z'])"),
      title: z
        .string()
        .optional()
        .describe("Schedule name (alphanumeric, defaults to 'default'). Used to reference this schedule in create_post."),
      daysOfWeek: z
        .array(z.number())
        .optional()
        .describe("Days to post: 0=Sunday through 6=Saturday (defaults to [0,6])"),
      excludeDates: z
        .array(z.string())
        .optional()
        .describe("Dates to skip (e.g. ['2026-01-01', '2026-12-25'])"),
      setStartDate: z
        .string()
        .optional()
        .describe("ISO 8601 UTC datetime for when scheduling begins"),
      profileKey: profileKeySchema,
    },
    async (args) => {
      try {
        const result = await client.setAutoSchedule(args);
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
    "list_auto_schedules",
    "List all configured auto-posting schedules with their times, days, and last scheduled dates. Requires Premium plan.",
    {
      profileKey: profileKeySchema,
    },
    async (args) => {
      try {
        const result = await client.listAutoSchedules(args.profileKey);
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
    "delete_auto_schedule",
    "Delete an auto-posting schedule by its title. Requires Premium plan.",
    {
      title: z
        .string()
        .describe("Schedule title to delete (case-sensitive, must match exactly)"),
      deleteLastScheduleDate: z
        .boolean()
        .optional()
        .describe("If true, also clears the last used schedule date, resetting future scheduling"),
      profileKey: profileKeySchema,
    },
    async (args) => {
      try {
        const result = await client.deleteAutoSchedule(args);
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
