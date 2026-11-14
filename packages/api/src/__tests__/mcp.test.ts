import { describe, expect, it, vi } from "vitest";

import { createMcpApi } from "../mcp/index.js";

describe("mcp API", () => {
  it("lists applications from the jobs API with bearer authentication", async () => {
    const applications = [{ id: "app-1", name: "website" }];
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(Response.json(applications));
    const api = createMcpApi({
      jobsApiBaseUrl: "http://jobs.test",
      bearerToken: "test-token",
      fetch,
    });

    await expect(api.listApplications()).resolves.toEqual(applications);
    expect(fetch).toHaveBeenCalledWith(
      new URL("/applications", "http://jobs.test"),
      { headers: { Authorization: "Bearer test-token" } },
    );
  });

  it("throws when the jobs API responds with an error", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response(null, { status: 503 }));
    const api = createMcpApi({
      jobsApiBaseUrl: "http://jobs.test",
      bearerToken: "test-token",
      fetch,
    });

    await expect(api.listApplications()).rejects.toThrow(
      "Failed to list applications: backend returned HTTP 503",
    );
  });

  it("throws when the jobs API response is not a list", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(Response.json({ applications: [] }));
    const api = createMcpApi({
      jobsApiBaseUrl: "http://jobs.test",
      bearerToken: "test-token",
      fetch,
    });

    await expect(api.listApplications()).rejects.toThrow(
      "Failed to list applications: backend response was not a list",
    );
  });
});
