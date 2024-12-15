/* eslint-disable ts/ban-ts-comment */
import { testClient } from "hono/testing";
import { describe, expect, it } from "vitest";

import env from "@/env";
import { ZOD_ERROR_MESSAGES } from "@/lib/constants";
import createApp from "@/lib/create-app";

import router from "./deployments.index";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

const client = testClient(createApp().route("/", router));
const httpOptions = {
  headers: { Authorization: `Bearer ${env.BEARER_TOKEN}` },
};

describe("applications routes", () => {
  it("post /applications validates the body when creating", async () => {
    const response = await client.applications.$post(
      {
        // @ts-expect-error
        json: {
          name: "electra",
        },
      },
      httpOptions,
    );
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("fqdn");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.REQUIRED);
    }
  });
});
