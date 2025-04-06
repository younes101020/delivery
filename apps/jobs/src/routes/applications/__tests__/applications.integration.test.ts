import { testClient } from "hono/testing";
import { describe, expect } from "vitest";

import createApp from "@/lib/create-app";

import router from "../applications.index";
import { it } from "./fixtures";

const client = testClient(createApp().route("/", router));

describe("application routes / integration test", () => {
  it("patch /applications/{name} return application info when payload is submited", async ({ applicationName }) => {
    const newPort = 7458;
    const response = await client.applications[":name"].$patch(
      {
        param: {
          name: applicationName,
        },
        json: {
          applicationData: { port: newPort },
        },
      },
    );
    if (response.status === 200) {
      const json = await response.json();
      expect(json.port).toBe(newPort);
    }
  });
});
