# Ayrshare Unofficial MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

An unofficial MCP (Model Context Protocol) server for the [Ayrshare](https://www.ayrshare.com) social media API. Enables AI agents to publish posts, manage profiles, upload media, handle comments, send messages, view analytics, and configure auto-scheduling — all through real API calls.

> **Note:** This is an unofficial, community-built project. It is not affiliated with or endorsed by Ayrshare. The official Ayrshare MCP server provides documentation access only — this server actually executes API calls on your behalf.

## Prerequisites

- **Node.js** >= 18.0.0
- An **Ayrshare account** with an API key ([get one here](https://www.ayrshare.com))
- At least a **Premium plan** for most features (Business plan for profiles and messaging)

## Installation

### Option 1: npx (Recommended)

Add to your MCP client configuration (e.g. Claude Desktop `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "ayrshare": {
      "command": "npx",
      "args": ["-y", "ayrshare-unofficial-mcp"],
      "env": {
        "AYRSHARE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Option 2: Claude Code

```bash
claude mcp add ayrshare -e AYRSHARE_API_KEY=your-api-key-here -- npx -y ayrshare-unofficial-mcp
```

### Option 3: Build from Source

```bash
git clone https://github.com/yardz/ayrshare-unofficial-mcp.git
cd ayrshare-unofficial-mcp
npm install
npm run build
```

Then configure your MCP client:

```json
{
  "mcpServers": {
    "ayrshare": {
      "command": "node",
      "args": ["/absolute/path/to/ayrshare-unofficial-mcp/build/index.js"],
      "env": {
        "AYRSHARE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Configuration

| Environment Variable | Required | Description |
|---|---|---|
| `AYRSHARE_API_KEY` | Yes | Your Ayrshare Primary Profile API key |
| `AYRSHARE_PROFILE_KEY` | No | Default Profile Key for user profile operations (Business plan) |

All tools also accept an optional `profileKey` parameter to override the default on a per-call basis.

## Available Tools (18)

### Posts (4 tools)

| Tool | Description | Min Plan |
|---|---|---|
| `create_post` | Publish or schedule a post to one or more social platforms | Basic |
| `get_post` | Get details of a specific post by ID | Basic |
| `get_post_history` | List post history with optional filters | Basic |
| `delete_post` | Delete a post or scheduled posts | Basic |

### Profiles (3 tools)

| Tool | Description | Min Plan |
|---|---|---|
| `create_profile` | Create a new user profile | Business |
| `list_profiles` | List all user profiles | Business |
| `update_profile` | Update a profile's settings | Business |

### Media (1 tool)

| Tool | Description | Min Plan |
|---|---|---|
| `upload_media` | Upload an image or video to the media library | Premium |

### Comments (3 tools)

| Tool | Description | Min Plan |
|---|---|---|
| `post_comment` | Post a comment on a social media post | Premium |
| `get_comments` | Get comments on a post | Premium |
| `delete_comment` | Delete a comment | Premium |

### Messages (2 tools)

| Tool | Description | Min Plan |
|---|---|---|
| `send_message` | Send a direct message (Facebook, Instagram, X) | Business |
| `get_messages` | Get messages and conversations | Business |

### Analytics (2 tools)

| Tool | Description | Min Plan |
|---|---|---|
| `get_post_analytics` | Get engagement metrics for a post | Premium |
| `get_social_analytics` | Get account-level analytics | Premium |

### Auto-Schedule (3 tools)

| Tool | Description | Min Plan |
|---|---|---|
| `set_auto_schedule` | Create or update an auto-posting schedule | Premium |
| `list_auto_schedules` | List all configured schedules | Premium |
| `delete_auto_schedule` | Delete a schedule | Premium |

## Tool Details

### Posts

#### `create_post`

Publish or schedule a social media post to one or more platforms. Supports text, images, videos, scheduling, and auto-scheduling.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `post` | string | Yes | Text content of the post (can be empty if mediaUrls provided) |
| `platforms` | string[] | Yes | Target platforms: `bluesky`, `facebook`, `gmb`, `instagram`, `linkedin`, `pinterest`, `reddit`, `snapchat`, `telegram`, `threads`, `tiktok`, `twitter`, `youtube` |
| `mediaUrls` | string[] | No | HTTPS URLs of images or videos to attach |
| `scheduleDate` | string | No | ISO 8601 UTC datetime (e.g. `2026-03-01T10:00:00Z`) |
| `shortenLinks` | boolean | No | Enable link shortening (requires Max Pack) |
| `requiresApproval` | boolean | No | Put post in approval workflow |
| `notes` | string | No | Internal reference notes |
| `autoSchedule` | object | No | `{ schedule: true, title?: "schedule-name" }` — queue to next slot |
| `profileKey` | string | No | Profile Key override |

**Example prompt:** *"Publish to Instagram and Twitter: 'New product launch! Check it out.' with this image: https://example.com/product.jpg"*

#### `get_post`

Get details of a specific post by its Ayrshare Post ID.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Ayrshare Post ID |
| `profileKey` | string | No | Profile Key override |

**Example prompt:** *"Show me the details of post abc123"*

#### `get_post_history`

List post history with optional filters.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `limit` | number | No | Posts to return (default 25, max 1000) |
| `platforms` | string[] | No | Filter by platforms |
| `status` | string | No | Filter: `success`, `error`, `processing`, `pending`, `paused`, `deleted`, `awaiting approval` |
| `type` | string | No | Filter: `immediate` or `scheduled` |
| `lastDays` | number | No | Last N days (default 30, 0 = all) |
| `profileKey` | string | No | Profile Key override |

**Example prompt:** *"Show me my last 10 posts on Instagram"*

#### `delete_post`

Delete a post from social platforms.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | No* | Ayrshare Post ID to delete |
| `bulk` | string[] | No* | Array of Post IDs for bulk deletion |
| `deleteAllScheduled` | boolean | No* | Delete all pending scheduled posts |
| `profileKey` | string | No | Profile Key override |

*At least one of `id`, `bulk`, or `deleteAllScheduled` is required.

**Example prompt:** *"Delete post abc123"*

---

### Profiles

#### `create_profile`

Create a new user profile for managing separate social media accounts.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `title` | string | Yes | Unique profile name |
| `messagingActive` | boolean | No | Enable messaging (default false) |
| `disableSocial` | string[] | No | Social networks to disable |
| `tags` | string[] | No | Tags for organizing |

**Example prompt:** *"Create a profile called 'Client ABC' with Instagram and Twitter enabled"*

#### `list_profiles`

List all user profiles with their linked social accounts.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `title` | string | No | Filter by title |
| `refId` | string | No | Filter by reference ID |
| `hasActiveSocialAccounts` | boolean | No | Filter by active accounts |
| `limit` | number | No | Max results (default 5000) |
| `cursor` | string | No | Pagination cursor |

**Example prompt:** *"List all my profiles and their connected social accounts"*

#### `update_profile`

Update an existing profile's settings.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `profileKey` | string | Yes | Profile Key to update |
| `title` | string | Yes | New profile title |
| `disableSocial` | string[] | No | Social networks to disable |
| `messagingActive` | boolean | No | Enable/disable messaging |
| `tags` | string[] | No | Tags for organizing |

**Example prompt:** *"Enable messaging on the 'Client ABC' profile"*

---

### Media

#### `upload_media`

Upload an image or video to Ayrshare's media library. Files are stored for 90 days. Max size: 30MB.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `fileUrl` | string | No* | Public URL of the file to upload |
| `base64Data` | string | No* | Base64 data URI (e.g. `data:image/png;base64,...`) |
| `fileName` | string | No | Name for the file |
| `description` | string | No | File description |
| `profileKey` | string | No | Profile Key override |

*One of `fileUrl` or `base64Data` is required.

**Example prompt:** *"Upload this image to my media library: https://example.com/photo.jpg"*

---

### Comments

#### `post_comment`

Post a comment on a social media post.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Ayrshare Post ID or Social Post ID |
| `comment` | string | Yes | Comment text |
| `platforms` | string[] | Yes | Target platforms: `bluesky`, `facebook`, `instagram`, `linkedin`, `reddit`, `tiktok`, `twitter`, `youtube` |
| `searchPlatformId` | boolean | No | Set true when using Social Post ID |
| `mediaUrls` | string[] | No | Image URLs to attach |
| `profileKey` | string | No | Profile Key override |

**Example prompt:** *"Comment 'Thanks for the feedback!' on my last Instagram post"*

#### `get_comments`

Get comments on a social media post.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Ayrshare Post ID, Social Post ID, or Social Comment ID |
| `searchPlatformId` | boolean | No | Set true when using Social Post ID |
| `commentId` | boolean | No | Set true when using Social Comment ID |
| `platform` | string | No | Required when `searchPlatformId` or `commentId` is true |
| `profileKey` | string | No | Profile Key override |

**Example prompt:** *"Show me the comments on post abc123"*

#### `delete_comment`

Delete a comment from a social media post. Supported on Facebook, Instagram, TikTok, X/Twitter, and YouTube.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Social Comment ID (from `get_comments`) |
| `platform` | string | Yes | Platform: `facebook`, `instagram`, `tiktok`, `twitter`, `youtube` |
| `profileKey` | string | No | Profile Key override |

**Example prompt:** *"Delete the spam comment xyz789 on Instagram"*

---

### Messages

#### `send_message`

Send a direct message on a social platform.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `platform` | string | Yes | `facebook`, `instagram`, or `twitter` |
| `recipientId` | string | Yes | Recipient's platform user ID |
| `message` | string | Yes | Message text |
| `mediaUrls` | string[] | No | Media file URLs to attach |
| `profileKey` | string | No | Profile Key override |

**Example prompt:** *"Send a message to user 12345 on Instagram saying 'Thanks for reaching out!'"*

#### `get_messages`

Get messages and conversations from a platform.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `platform` | string | Yes | `facebook`, `instagram`, or `twitter` |
| `status` | string | No | `active` or `archived` (default: active) |
| `conversationId` | string | No | Get a specific conversation |
| `conversationsOnly` | boolean | No | Return only conversation list (default: false) |
| `profileKey` | string | No | Profile Key override |

**Example prompt:** *"Show me my recent Instagram conversations"*

---

### Analytics

#### `get_post_analytics`

Get engagement analytics for a specific post (likes, views, shares, impressions, comments).

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Ayrshare Post ID |
| `platforms` | string[] | No | Filter by platforms (omit for all) |
| `profileKey` | string | No | Profile Key override |

> **Note:** TikTok and YouTube analytics can take 24-48 hours to update.

**Example prompt:** *"What are the engagement metrics for my last post?"*

#### `get_social_analytics`

Get account-level analytics (follower count, demographics, impressions, engagement rates).

| Parameter | Type | Required | Description |
|---|---|---|---|
| `platforms` | string[] | Yes | Platforms to get analytics for |
| `quarters` | number | No | Historical range 1-4 quarters (Facebook/Instagram/YouTube) |
| `daily` | boolean | No | Return daily time-series (Facebook/Instagram/TikTok/YouTube) |
| `profileKey` | string | No | Profile Key override |

**Example prompt:** *"Show me my Instagram follower demographics and engagement rate"*

---

### Auto-Schedule

#### `set_auto_schedule`

Create or update an auto-posting schedule with predefined times and days. Posts created with `autoSchedule` in `create_post` will be queued to the next available slot.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `schedule` | string[] | Yes | Times in UTC (e.g. `["09:00Z", "14:00Z", "18:00Z"]`) |
| `title` | string | No | Schedule name (defaults to "default") |
| `daysOfWeek` | number[] | No | 0=Sunday through 6=Saturday (defaults to [0,6]) |
| `excludeDates` | string[] | No | Dates to skip (e.g. `["2026-01-01"]`) |
| `setStartDate` | string | No | ISO 8601 UTC datetime to begin scheduling |
| `profileKey` | string | No | Profile Key override |

**Example prompt:** *"Set up auto-scheduling for Monday through Friday at 9am, 2pm, and 6pm UTC"*

#### `list_auto_schedules`

List all configured auto-posting schedules.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `profileKey` | string | No | Profile Key override |

**Example prompt:** *"Show me all my auto-posting schedules"*

#### `delete_auto_schedule`

Delete an auto-posting schedule by title.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `title` | string | Yes | Schedule title (case-sensitive) |
| `deleteLastScheduleDate` | boolean | No | Also clear the last schedule date |
| `profileKey` | string | No | Profile Key override |

**Example prompt:** *"Delete the 'Weekend Posts' auto-schedule"*

## Supported Platforms

| Platform | Post | Comment | Message | Analytics |
|---|---|---|---|---|
| Bluesky | Yes | Yes | - | Yes |
| Facebook | Yes | Yes | Yes | Yes |
| Google Business | Yes | - | - | Yes |
| Instagram | Yes | Yes | Yes | Yes |
| LinkedIn | Yes | Yes | - | Yes |
| Pinterest | Yes | - | - | Yes |
| Reddit | Yes | Yes | - | Yes |
| Snapchat | Yes | - | - | Yes |
| Telegram | Yes | - | - | - |
| Threads | Yes | - | - | Yes |
| TikTok | Yes | Yes | - | Yes |
| X (Twitter) | Yes | Yes | Yes | Yes |
| YouTube | Yes | Yes | - | Yes |

## Plan Requirements

| Feature | Basic | Premium | Business | Enterprise |
|---|---|---|---|---|
| Posts (create, get, history, delete) | Yes | Yes | Yes | Yes |
| Media Upload | - | Yes | Yes | Yes |
| Comments (post, get, delete) | - | Yes | Yes | Yes |
| Analytics (post, social) | - | Yes | Yes | Yes |
| Auto-Schedule (set, list, delete) | - | Yes | Yes | Yes |
| Profiles (create, list, update) | - | - | Yes | Yes |
| Messages (send, get) | - | - | Yes | Yes |

## Error Handling

All tools return structured error responses when something goes wrong:

- **API errors** from Ayrshare are returned with the original error code and message
- **Network errors** are caught and returned with a descriptive message
- **Validation errors** (e.g. missing required parameters) are caught before the API call

Error responses have `isError: true` set so the AI agent can distinguish them from successful responses.

## Development

### Build

```bash
npm install
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector node build/index.js
```

Set the `AYRSHARE_API_KEY` environment variable before running the inspector.

## License

MIT
