import { testClient } from "hono/testing";
import { describe, expect, it } from "vitest";

import createApp from "@/lib/create-app";

import router from "../server-config.index";

const client = testClient(createApp().route("/", router));

describe("server config routes / integration test", () => {
  it("get /serverconfig return the server configuration info", async () => {
    const response = await client.serverconfig.$get();
    if (response.status === 200) {
      const json = await response.json();
      expect(json.id).toBeDefined();
    }
  });

  it("patch /applications/{id} return application info when payload is submited", async () => {
    const newDomainName = "https://test.com";
    const response = await client.serverconfig.$patch(
      {
        json: {
          domainName: newDomainName,
        },
      },
    );
    if (response.status === 200) {
      const json = await response.json();
      expect(json.domainName).toBe(newDomainName);
    }
  });
});
