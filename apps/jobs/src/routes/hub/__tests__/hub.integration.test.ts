import { testClient } from "hono/testing";
import { describe, expect, it } from "vitest";

import createApp from "@/lib/create-app";

import router from "../hub.index";

const client = testClient(createApp().route("/", router));

describe("hub routes", () => {
  it("post /hub/pull validates the Docker image", async () => {
    const response = await client.hub.pull.$post({
      // @ts-expect-error test purpose
      json: {},
    });

    expect(response.status).toBe(422);
  });

  it("post /hub/stacks/start validates duplicate node IDs", async () => {
    const response = await client.hub.stacks.start.$post({
      json: {
        project: { id: "project-1", name: "Project 1" },
        services: [
          { nodeId: "node-1", image: "nginx", ports: "80", environmentVariables: "", startCommand: "" },
          { nodeId: "node-1", image: "redis", ports: "6379", environmentVariables: "", startCommand: "" },
        ],
      },
    });

    expect(response.status).toBe(422);
  });
});
