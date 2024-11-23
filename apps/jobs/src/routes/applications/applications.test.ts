/* eslint-disable ts/ban-ts-comment */
import { testClient } from "hono/testing";
import { execSync } from "node:child_process";
import fs from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import env from "@/env";
import { ZOD_ERROR_MESSAGES } from "@/lib/constants";
import createApp from "@/lib/create-app";

import router from "./applications.index";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

const client = testClient(createApp().route("/", router));

describe("applications routes", () => {
  beforeAll(async () => {
    execSync("yarn drizzle-kit push");
  });

  afterAll(async () => {
    fs.rmSync("test.db", { force: true });
  });

  it("post /applications validates the body when creating", async () => {
    const response = await client.applications.$post(
      {
        // @ts-expect-error
        json: {
          name: "electra",
        },
      },
      { headers: { Authorization: `Bearer ${env.BEARER_TOKEN}` } },
    );
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("fqdn");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.REQUIRED);
    }
  });
});
