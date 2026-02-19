const BASE_URL = "https://api.ayrshare.com/api";

export class AyrshareClient {
  private apiKey: string;
  private profileKey?: string;

  constructor(apiKey: string, profileKey?: string) {
    this.apiKey = apiKey;
    this.profileKey = profileKey;
  }

  private getHeaders(profileKeyOverride?: string): Record<string, string> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
    const pk = profileKeyOverride || this.profileKey;
    if (pk) {
      headers["Profile-Key"] = pk;
    }
    return headers;
  }

  private async request(
    method: string,
    path: string,
    body?: Record<string, unknown>,
    profileKey?: string,
    query?: Record<string, string>,
  ): Promise<unknown> {
    let url = `${BASE_URL}${path}`;
    if (query) {
      const params = new URLSearchParams(query);
      url += `?${params.toString()}`;
    }

    const options: RequestInit = {
      method,
      headers: this.getHeaders(profileKey),
    };

    if (body && (method === "POST" || method === "PATCH" || method === "DELETE")) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    return response.json();
  }

  // --- Posts ---

  async createPost(params: {
    post: string;
    platforms: string[];
    mediaUrls?: string[];
    scheduleDate?: string;
    shortenLinks?: boolean;
    requiresApproval?: boolean;
    notes?: string;
    autoSchedule?: { schedule: boolean; title?: string };
    profileKey?: string;
  }): Promise<unknown> {
    const { profileKey, ...body } = params;
    return this.request("POST", "/post", body as Record<string, unknown>, profileKey);
  }

  async getPost(id: string, profileKey?: string): Promise<unknown> {
    return this.request("GET", `/post/${encodeURIComponent(id)}`, undefined, profileKey);
  }

  async getPostHistory(params: {
    limit?: number;
    platforms?: string[];
    status?: string;
    type?: string;
    lastDays?: number;
    profileKey?: string;
  }): Promise<unknown> {
    const { profileKey, ...queryParams } = params;
    const query: Record<string, string> = {};
    if (queryParams.limit !== undefined) query.limit = String(queryParams.limit);
    if (queryParams.platforms) query.platforms = JSON.stringify(queryParams.platforms);
    if (queryParams.status) query.status = queryParams.status;
    if (queryParams.type) query.type = queryParams.type;
    if (queryParams.lastDays !== undefined) query.lastDays = String(queryParams.lastDays);
    return this.request("GET", "/history", undefined, profileKey, query);
  }

  async deletePost(params: {
    id?: string;
    bulk?: string[];
    deleteAllScheduled?: boolean;
    profileKey?: string;
  }): Promise<unknown> {
    const { profileKey, ...body } = params;
    return this.request("DELETE", "/post", body as Record<string, unknown>, profileKey);
  }

  // --- Profiles ---

  async createProfile(params: {
    title: string;
    messagingActive?: boolean;
    disableSocial?: string[];
    tags?: string[];
  }): Promise<unknown> {
    return this.request("POST", "/profiles", params as Record<string, unknown>);
  }

  async listProfiles(params: {
    title?: string;
    refId?: string;
    hasActiveSocialAccounts?: boolean;
    limit?: number;
    cursor?: string;
  }): Promise<unknown> {
    const query: Record<string, string> = {};
    if (params.title) query.title = params.title;
    if (params.refId) query.refId = params.refId;
    if (params.hasActiveSocialAccounts !== undefined)
      query.hasActiveSocialAccounts = String(params.hasActiveSocialAccounts);
    if (params.limit !== undefined) query.limit = String(params.limit);
    if (params.cursor) query.cursor = params.cursor;
    return this.request("GET", "/profiles", undefined, undefined, query);
  }

  async updateProfile(params: {
    profileKey: string;
    title: string;
    disableSocial?: string[];
    messagingActive?: boolean;
    tags?: string[];
  }): Promise<unknown> {
    const { profileKey, ...body } = params;
    return this.request("PATCH", "/profiles", body as Record<string, unknown>, profileKey);
  }

  // --- Media ---

  async uploadMedia(params: {
    fileUrl?: string;
    base64Data?: string;
    fileName?: string;
    description?: string;
    profileKey?: string;
  }): Promise<unknown> {
    const { profileKey, fileUrl, base64Data, ...rest } = params;

    if (fileUrl) {
      const fileResponse = await fetch(fileUrl);
      const arrayBuffer = await fileResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = fileResponse.headers.get("content-type") || "application/octet-stream";
      const dataUri = `data:${contentType};base64,${buffer.toString("base64")}`;

      return this.request(
        "POST",
        "/media/upload",
        { file: dataUri, ...rest } as Record<string, unknown>,
        profileKey,
      );
    }

    if (base64Data) {
      return this.request(
        "POST",
        "/media/upload",
        { file: base64Data, ...rest } as Record<string, unknown>,
        profileKey,
      );
    }

    throw new Error("Either fileUrl or base64Data must be provided");
  }

  // --- Comments ---

  async postComment(params: {
    id: string;
    comment: string;
    platforms: string[];
    searchPlatformId?: boolean;
    mediaUrls?: string[];
    profileKey?: string;
  }): Promise<unknown> {
    const { profileKey, ...body } = params;
    return this.request("POST", "/comments", body as Record<string, unknown>, profileKey);
  }

  async getComments(params: {
    id: string;
    searchPlatformId?: boolean;
    commentId?: boolean;
    platform?: string;
    profileKey?: string;
  }): Promise<unknown> {
    const { profileKey, id, ...queryParams } = params;
    const query: Record<string, string> = {};
    if (queryParams.searchPlatformId !== undefined)
      query.searchPlatformId = String(queryParams.searchPlatformId);
    if (queryParams.commentId !== undefined) query.commentId = String(queryParams.commentId);
    if (queryParams.platform) query.platform = queryParams.platform;
    return this.request(
      "GET",
      `/comments/${encodeURIComponent(id)}`,
      undefined,
      profileKey,
      query,
    );
  }

  async deleteComment(params: {
    id: string;
    platform: string;
    profileKey?: string;
  }): Promise<unknown> {
    const { profileKey, id, platform } = params;
    return this.request(
      "DELETE",
      `/comments/${encodeURIComponent(id)}`,
      { searchPlatformId: true, platform } as Record<string, unknown>,
      profileKey,
    );
  }

  // --- Messages ---

  async sendMessage(params: {
    platform: string;
    recipientId: string;
    message: string;
    mediaUrls?: string[];
    profileKey?: string;
  }): Promise<unknown> {
    const { profileKey, platform, ...body } = params;
    return this.request(
      "POST",
      `/messages/${encodeURIComponent(platform)}`,
      body as Record<string, unknown>,
      profileKey,
    );
  }

  async getMessages(params: {
    platform: string;
    status?: string;
    conversationId?: string;
    conversationsOnly?: boolean;
    profileKey?: string;
  }): Promise<unknown> {
    const { profileKey, platform, ...queryParams } = params;
    const query: Record<string, string> = {};
    if (queryParams.status) query.status = queryParams.status;
    if (queryParams.conversationId) query.conversationId = queryParams.conversationId;
    if (queryParams.conversationsOnly !== undefined)
      query.conversationsOnly = String(queryParams.conversationsOnly);
    return this.request(
      "GET",
      `/messages/${encodeURIComponent(platform)}`,
      undefined,
      profileKey,
      query,
    );
  }

  // --- Analytics ---

  async getPostAnalytics(params: {
    id: string;
    platforms?: string[];
    profileKey?: string;
  }): Promise<unknown> {
    const { profileKey, ...body } = params;
    return this.request("POST", "/analytics/post", body as Record<string, unknown>, profileKey);
  }

  async getSocialAnalytics(params: {
    platforms: string[];
    quarters?: number;
    daily?: boolean;
    profileKey?: string;
  }): Promise<unknown> {
    const { profileKey, ...body } = params;
    return this.request("POST", "/analytics/social", body as Record<string, unknown>, profileKey);
  }

  // --- Auto-Schedule ---

  async setAutoSchedule(params: {
    schedule: string[];
    title?: string;
    daysOfWeek?: number[];
    excludeDates?: string[];
    setStartDate?: string;
    profileKey?: string;
  }): Promise<unknown> {
    const { profileKey, ...body } = params;
    return this.request("POST", "/auto-schedule/set", body as Record<string, unknown>, profileKey);
  }

  async listAutoSchedules(profileKey?: string): Promise<unknown> {
    return this.request("GET", "/auto-schedule/list", undefined, profileKey);
  }

  async deleteAutoSchedule(params: {
    title: string;
    deleteLastScheduleDate?: boolean;
    profileKey?: string;
  }): Promise<unknown> {
    const { profileKey, ...body } = params;
    return this.request(
      "DELETE",
      "/auto-schedule/delete",
      body as Record<string, unknown>,
      profileKey,
    );
  }
}
