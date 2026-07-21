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
});
