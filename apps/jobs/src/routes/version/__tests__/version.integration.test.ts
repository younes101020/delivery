import { testClient } from "hono/testing";
import { describe, expect, it, vi } from "vitest";

import createApp from "@/lib/create-app";

import router from "../version.index";

const client = testClient(createApp().route("/", router));

vi.mock("dockerode");

describe("version routes / integration test", () => {
  it("get /version return version information", async () => {
    const response = await client.version.$get();
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.isLatest).toBeDefined();
      expect(json.version).toBeDefined();
      expect(json.imageDigest).toBeDefined();
    }
  });
  it("post /version return new version", async () => {
    const response = await client.version.$put();
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.version).toBeDefined();
    }
  });
});
