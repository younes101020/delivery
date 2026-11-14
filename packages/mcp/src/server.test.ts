import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createMcpServer } from "./server.js";

describe("list_applications", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches applications from the jobs API with bearer authentication", async () => {
    const applications = [{ id: "app-1", name: "website" }];
    const fetchMock = vi.fn().mockResolvedValue(Response.json(applications));
    vi.stubGlobal("fetch", fetchMock);

    const server = createMcpServer({
      apiBaseUrl: "http://jobs.test",
      bearerToken: "test-token",
    });
    const client = new Client({ name: "test-client", version: "1.0.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await server.connect(serverTransport);
    await client.connect(clientTransport);

    const result = await client.callTool({ name: "list_applications" });

    expect(fetchMock).toHaveBeenCalledWith(
      new URL("/applications", "http://jobs.test"),
      { headers: { Authorization: "Bearer test-token" } },
    );
    expect(result.content).toEqual([
      { type: "text", text: JSON.stringify(applications, null, 2) },
    ]);

    await client.close();
    await server.close();
  });

  it("reports backend errors rather than returning an empty list", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 503 })));

    const server = createMcpServer({
      apiBaseUrl: "http://jobs.test",
      bearerToken: "test-token",
    });
    const client = new Client({ name: "test-client", version: "1.0.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await server.connect(serverTransport);
    await client.connect(clientTransport);

    const result = await client.callTool({ name: "list_applications" });

    expect(result).toMatchObject({
      isError: true,
      content: [
        {
          type: "text",
          text: "Failed to list applications: backend returned HTTP 503",
        },
      ],
    });

    await client.close();
    await server.close();
  });
});
