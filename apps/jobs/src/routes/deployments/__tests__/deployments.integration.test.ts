/* eslint-disable ts/ban-ts-comment */
import { testClient } from "hono/testing";
import { describe, expect, it } from "vitest";

import { ZOD_ERROR_MESSAGES } from "@/lib/constants";
import createApp from "@/lib/create-app";

import router from "../deployments.index";

const client = testClient(createApp().route("/", router));

describe("deployments routes", () => {
  it("post /deployments validates the body when creating", async () => {
    const response = await client.deployments.$post(
      {
        // @ts-expect-error
        json: {
          githubAppId: 1,
          port: "3000:3000",
        },
      },
    );
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("repoUrl");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.REQUIRED);
    }
  });
});
