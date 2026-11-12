import { describe, expect, it, vi } from "vitest";

import { createApiHandlers } from "../index.js";

describe("api handlers", () => {
  it("returns query results as JSON", async () => {
    const handlers = createApiHandlers(createDependencies({
      getApplications: async () => [{ name: "example" }],
    }));

    const response = await handlers.getApplications();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([{ name: "example" }]);
  });

  it("redeploys an application for repository webhook events", async () => {
    const redeployApplication = vi.fn(async () => {});
    const handlers = createApiHandlers(createDependencies({
      getApplications: async () => [{ name: "example" }],
      redeployApplication,
    }));

    const response = await handlers.postGithubEvents(new Request("https://delivery.test/api/webhooks/github/events", {
      method: "POST",
      body: JSON.stringify({
        action: "opened",
        repository: { url: "https://github.com/delivery/example" },
      }),
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ message: "Application redeploy" });
    expect(redeployApplication).toHaveBeenCalledWith("example");
  });

  it("forwards deployment streams with the BFF stream headers", async () => {
    const handlers = createApiHandlers(createDependencies({
      getDeploymentCountStream: async () => new Response("event: update\n\n"),
    }));

    const response = await handlers.getDeploymentCountStream();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
    expect(response.headers.get("Cache-Control")).toBe("no-cache, no-transform");
    await expect(response.text()).resolves.toBe("event: update\n\n");
  });

  it("redirects to GitHub installation after registering an app", async () => {
    const handlers = createApiHandlers(createDependencies({
      fetch: async () => Response.json({
        id: 123,
        slug: "delivery-app",
        client_id: "client-id",
        client_secret: "client-secret",
        webhook_secret: "webhook-secret",
        pem: "private-key",
        name: "Delivery",
      }),
      createGithubApp: async () => Response.json({ appId: 456 }),
    }));

    const response = await handlers.getGithubRegister(new Request("https://delivery.test/api/webhooks/github/register?code=manifest&state=true"));

    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toContain("https://github.com/apps/delivery-app/installations/new");
    expect(response.headers.get("Location")).toContain("state=");
  });

  it("uses a relative temporary redirect when an installation is missing", async () => {
    const handlers = createApiHandlers(createDependencies());
    const state = encodeURIComponent(JSON.stringify({ isOnboarding: true, appId: "123" }));

    const response = await handlers.getGithubInstall(new Request(`https://delivery.test/api/webhooks/github/install?state=${state}`));

    expect(response.status).toBe(307);
    expect(response.headers.get("Location")).toBe("/onboarding/?step=3");
  });
});

function createDependencies(overrides: Partial<Parameters<typeof createApiHandlers>[0]> = {}): Parameters<typeof createApiHandlers>[0] {
  return {
    getApplications: async () => [],
    getApplicationByName: async () => null,
    getDatabaseService: async () => null,
    getApplicationsDomainConfiguration: async () => null,
    getCurrentDeploymentsState: async () => [],
    getPreviousDeploymentsState: async () => [],
    getDeliveryWebInstanceConfiguration: async () => null,
    getUser: async () => null,
    getTeamForUser: async () => null,
    getDeliveryVersionInfo: async () => null,
    getDeploymentCountStream: async () => new Response(null),
    getDeploymentLogs: async () => new Response(null),
    getDeploymentPreview: async () => new Response(null),
    getApplicationsStream: async () => new Response(null),
    getDatabasesStream: async () => new Response(null),
    redeployApplication: async () => {},
    createGithubApp: async () => new Response(null, { status: 200 }),
    setInstallationIdOnGithubApp: async () => {},
    fetch: async () => new Response(null, { status: 200 }),
    getWebBaseUrl: () => "https://delivery.test",
    ...overrides,
  };
}
