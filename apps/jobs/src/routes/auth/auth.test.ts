/* eslint-disable ts/ban-ts-comment */
import { it } from "__tests__";
import { testClient } from "hono/testing";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { describe, expect } from "vitest";

import env from "@/env";
import { ZOD_ERROR_MESSAGES } from "@/lib/constants";
import createApp from "@/lib/create-app";

import router from "./auth.index";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

const client = testClient(createApp().route("/", router));
const httpOptions = {
  headers: { Authorization: `Bearer ${env.BEARER_TOKEN}` },
};

describe("auth routes / E2E", () => {
  it("post /auth validates the body when verifying", async ({ users }) => {
    const { email } = users[0];
    const response = await client.auth.$post(
      {
        // @ts-expect-error
        json: {
          email,
        },
      },
      httpOptions,
    );
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("passwordHash");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.REQUIRED);
    }
  });

  it("post /auth return 401 when password is wrong", async ({ users }) => {
    const { email, passwordHash } = users[0];
    const wrongPassword = `${passwordHash}wrong`;
    const response = await client.auth.$post(
      {
        json: {
          email,
          passwordHash: wrongPassword,
        },
      },
      httpOptions,
    );
    expect(response.status).toBe(401);
    if (response.status === 401) {
      const json = await response.json();
      expect(json.message).toBe(HttpStatusPhrases.UNAUTHORIZED);
    }
  });

  it("post /auth return 401 when email is wrong", async ({ users }) => {
    const { email, passwordHash } = users[0];
    const wrongEmail = `${email}wrong`;
    const response = await client.auth.$post(
      {
        json: {
          email: wrongEmail,
          passwordHash,
        },
      },
      httpOptions,
    );
    expect(response.status).toBe(401);
    if (response.status === 401) {
      const json = await response.json();
      expect(json.message).toBe(HttpStatusPhrases.UNAUTHORIZED);
    }
  });
});
