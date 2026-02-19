import { z } from "zod";

export const PLATFORMS = [
  "bluesky",
  "facebook",
  "gmb",
  "instagram",
  "linkedin",
  "pinterest",
  "reddit",
  "snapchat",
  "telegram",
  "threads",
  "tiktok",
  "twitter",
  "youtube",
] as const;

export const MESSAGING_PLATFORMS = [
  "facebook",
  "instagram",
  "twitter",
] as const;

export const COMMENT_PLATFORMS = [
  "bluesky",
  "facebook",
  "instagram",
  "linkedin",
  "reddit",
  "tiktok",
  "twitter",
  "youtube",
] as const;

export const platformsSchema = z.enum(PLATFORMS);
export const messagingPlatformsSchema = z.enum(MESSAGING_PLATFORMS);
export const commentPlatformsSchema = z.enum(COMMENT_PLATFORMS);

export const profileKeySchema = z
  .string()
  .optional()
  .describe("Profile Key to operate on a specific user profile");
