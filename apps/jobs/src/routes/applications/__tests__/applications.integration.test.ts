import { testClient } from "hono/testing";
import { describe, expect } from "vitest";

import { ZOD_ERROR_MESSAGES } from "@/lib/constants";
import createApp from "@/lib/create-app";

import router from "../applications.index";
import { it } from "./fixtures";

const client = testClient(createApp().route("/", router));

describe("application routes / integration test", () => {
  it("get /applications/{slug} return application info when payload is submited", async ({ applicationName }) => {
    const response = await client.applications[":slug"].$get(
      {
        param: {
          slug: applicationName,
        },
      },
    );
    if (response.status === 200) {
      const json = await response.json();
      expect(json.name).toBe(applicationName);
    }
  });

  it("get /applications/{slug} validates the param application id", async () => {
    const response = await client.applications[":slug"].$get(
      {
        // @ts-expect-error test purpose
        param: { slug: 10 },
      },
    );
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("slug");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER);
    }
  });

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
