import { testClient } from "hono/testing";
import { describe, expect } from "vitest";

import { ZOD_ERROR_MESSAGES } from "@/lib/constants";
import createApp from "@/lib/create-app";

import router from "../envvars.index";
import { it } from "./fixtures";

const client = testClient(createApp().route("/", router));

describe("envvars routes / integration test", () => {
  it("post /envvars validates the body when creating", async () => {
    const response = await client.envvars.$post(
      {
        // @ts-expect-error test purpose
        json: { key: "MY_ENV_VAR" },
      },
    );
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("value");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.REQUIRED);
    }
  });

  it("post /envvars creates a githubapps", async ({ envVarAppPayload }) => {
    const response = await client.envvars.$post({
      json: envVarAppPayload,
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.value).toBe(envVarAppPayload.value);
    }
  });
});
