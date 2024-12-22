/* eslint-disable ts/ban-ts-comment */
import { it } from "__tests__";
import { testClient } from "hono/testing";
import { Buffer } from "node:buffer";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { describe, expect, expectTypeOf } from "vitest";

import env from "@/env";
import { ZOD_ERROR_MESSAGES } from "@/lib/constants";
import createApp from "@/lib/create-app";
import { decryptSecret, encryptSecret } from "@/lib/utils";

import router from "./githubapps.index";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

const client = testClient(createApp().route("/", router));
const httpOptions = {
  headers: { Authorization: `Bearer ${env.BEARER_TOKEN}` },
};

describe("applications routes / E2E", () => {
  it("post /githubapps validates the body when creating", async ({ githubApps }) => {
    const { clientId, appId, clientSecret, webhookSecret } = githubApps[0];
    const response = await client.githubapps.$post(
      {
        // @ts-expect-error
        json: {
          clientId,
          appId,
          clientSecret,
          webhookSecret,
        },
      },
      httpOptions,
    );
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("privateKey");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.REQUIRED);
    }
  });

  it("post /githubapps creates a githubapps", async ({ githubApps }) => {
    const githubApp = githubApps[0];
    const response = await client.githubapps.$post({
      json: githubApp,
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.appId).toBe(githubApp.appId);
    }
  });

  it("get /githubapps lists all githubapps", async () => {
    const response = await client.githubapps.$get();
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expectTypeOf(json).toBeArray();
      expect(json.length).toBe(1);
    }
  });

  it("get /githubapps/{id} returns 404 when githubapps not found", async () => {
    const response = await client.githubapps[":id"].$get({
      param: {
        id: "2",
      },
    });
    expect(response.status).toBe(404);
    if (response.status === 404) {
      const json = await response.json();
      expect(json.message).toBe(HttpStatusPhrases.NOT_FOUND);
    }
  });

  it("get /githubapps/{id} gets a single githubapp", async ({ githubApps }) => {
    const { privateKey } = githubApps[0];
    const response = await client.githubapps[":id"].$get({
      param: {
        id: "1",
      },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.privateKey).toBe(privateKey);
    }
  });

  describe("applications routes / UT", () => {
    it("should decrypt an encrypted github app private key", async ({ githubApps }) => {
      const { privateKey } = githubApps[0];
      const { encryptedData, iv, key } = await encryptSecret(privateKey);

      const importedKey = await crypto.subtle.importKey(
        "raw",
        Buffer.from(key, "base64"),
        { name: "AES-GCM", length: 256 },
        true,
        ["decrypt"],
      );

      const decryptedSecret = await decryptSecret({
        encryptedData: Buffer.from(encryptedData, "base64"),
        iv: Buffer.from(iv, "base64"),
        key: importedKey,
      });

      expect(decryptedSecret).toBe(privateKey);
    });

    it("should generate encrypted github app private key with base64 properties", async ({
      githubApps,
    }) => {
      const { privateKey } = githubApps[0];
      const { encryptedData, iv, key } = await encryptSecret(privateKey);

      expect(encryptedData).toBeTruthy();
      expect(iv).toBeTruthy();
      expect(key).toBeTruthy();

      expect(() => atob(encryptedData)).not.toThrow();
      expect(() => atob(iv)).not.toThrow();
      expect(() => atob(key)).not.toThrow();
    });
  });
});
