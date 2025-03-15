import { testClient } from "hono/testing";
import { describe, expect } from "vitest";

import { ZOD_ERROR_MESSAGES } from "@/lib/constants";
import createApp from "@/lib/create-app";

import router from "../applications.index";
import { it } from "./fixtures";

const client = testClient(createApp().route("/", router));

describe("application routes / integration test", () => {
  it("patch /applications/{slug} return application info when payload is submited", async ({ applicationName }) => {
    const newPort = 7458;
    const response = await client.applications[":slug"].$patch(
      {
        param: {
          slug: applicationName,
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
