import { testClient } from "hono/testing";
import { describe, expect } from "vitest";

import { ZOD_ERROR_MESSAGES } from "@/lib/constants";
import createApp from "@/lib/create-app";

import router from "../applications.index";
import { it } from "./fixtures";

const client = testClient(createApp().route("/", router));

describe("application routes / integration test", () => {
  it("get /applications/{id} return application info when payload is submited", async ({ applicationId }) => {
    const response = await client.applications[":id"].$get(
      {
        param: {
          id: applicationId,
        },
      },
    );
    if (response.status === 200) {
      const json = await response.json();
      expect(json.id).toBe(Number.parseInt(applicationId));
    }
  });

  it("get /applications/{id} validates the param application id", async () => {
    const response = await client.applications[":id"].$get(
      {
        param: { id: "not-a-number" },
      },
    );
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("id");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER);
    }
  });

  it("patch /applications/{id} return application info when payload is submited", async ({ applicationId }) => {
    const newPort = "7854:7458";
    const response = await client.applications[":id"].$patch(
      {
        param: {
          id: applicationId,
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
