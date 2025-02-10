/* eslint-disable ts/ban-ts-comment */
import { testClient } from "hono/testing";
import { describe, expect } from "vitest";

import { ZOD_ERROR_MESSAGES } from "@/lib/constants";
import createApp from "@/lib/create-app";

import router from "../deployments.index";
import { it } from "./fixtures";

const client = testClient(createApp().route("/", router));

describe("deployments routes", () => {
  it("post /deployments validates the repository url when creating", async () => {
    const response = await client.deployments.$post(
      {
        // @ts-expect-error
        json: {
          githubAppId: 1,
          port: 3000,
          cache: true,
          staticdeploy: false,
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

  it("post /deployments validates the port when creating", async ({ repoUrl }) => {
    const response = await client.deployments.$post(
      {
        json: {
          githubAppId: 1,
          // @ts-expect-error
          port: "not-a-number",
          cache: true,
          staticdeploy: false,
          repoUrl,
        },
      },
    );
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("port");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER);
    }
  });
});
