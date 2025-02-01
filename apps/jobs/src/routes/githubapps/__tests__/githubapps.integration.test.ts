/* eslint-disable ts/ban-ts-comment */
import { testClient } from "hono/testing";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { describe, expect, expectTypeOf } from "vitest";

import { ZOD_ERROR_MESSAGES } from "@/lib/constants";
import createApp from "@/lib/create-app";

import router from "../githubapps.index";
import { it } from "./fixtures";

const client = testClient(createApp().route("/", router));

describe("applications routes / integration test", () => {
  it("post /githubapps validates the body when creating", async ({ githubAppPayload }) => {
    const { clientId, clientSecret, webhookSecret, appId } = githubAppPayload;
    const response = await client.githubapps.$post(
      {
        // @ts-expect-error
        json: { clientId, clientSecret, webhookSecret, appId },
      },
    );
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("privateKey");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.REQUIRED);
    }
  });

  /*it("post /githubapps creates a githubapps", async ({ githubAppPayload }) => {
    const response = await client.githubapps.$post({
      json: githubAppPayload,
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.appId).toBe(githubAppPayload.appId);
    }
  });*/

  it("get /githubapps lists all githubapps", async () => {
    const response = await client.githubapps.$get();
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expectTypeOf(json).toBeArray();
      expect(json.length).toBeGreaterThan(1);
    }
  });

  it("get /githubapps/{id} returns 404 when githubapps not found", async () => {
    const response = await client.githubapps[":id"].$get({
      param: {
        id: "100000",
      },
    });
    expect(response.status).toBe(404);
    if (response.status === 404) {
      const json = await response.json();
      expect(json.message).toBe(HttpStatusPhrases.NOT_FOUND);
    }
  });

  it("get /githubapps/{id} gets a single githubapp", async ({ registeredGithubAppId }) => {
    const response = await client.githubapps[":id"].$get({
      param: {
        id: registeredGithubAppId,
      },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.id).toBe(Number.parseInt(registeredGithubAppId));
    }
  });
});
