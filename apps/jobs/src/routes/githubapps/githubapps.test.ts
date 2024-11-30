/* eslint-disable ts/ban-ts-comment */
import { testClient } from "hono/testing";
import { Buffer } from "node:buffer";
import { describe, expect, it } from "vitest";

import env from "@/env";
import { ZOD_ERROR_MESSAGES } from "@/lib/constants";
import createApp from "@/lib/create-app";

import { decryptSecret, encryptSecret } from "./githubapps.handlers";
import router from "./githubapps.index";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

const client = testClient(createApp().route("/", router));
const httpOptions = {
  headers: { Authorization: `Bearer ${env.BEARER_TOKEN}` },
};

describe("applications routes", () => {
  it("post /applications validates the body when creating", async () => {
    const response = await client.githubapps.$post(
      {
        // @ts-expect-error
        json: {
          clientId: "5",
          appId: "78",
          clientSecret: "sqpmfjkgsdf",
          webhookSecret: "oksdfokfd",
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

  it("should generate encrypted github app private key with base64 properties", async () => {
    const privateKey = "test-secret";
    const { encryptedData, iv, key } = await encryptSecret(privateKey);

    expect(encryptedData).toBeTruthy();
    expect(iv).toBeTruthy();
    expect(key).toBeTruthy();

    expect(() => atob(encryptedData)).not.toThrow();
    expect(() => atob(iv)).not.toThrow();
    expect(() => atob(key)).not.toThrow();
  });

  it("should decrypt an encrypted github app private key", async () => {
    const privateKey = "test-secret";
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
});
