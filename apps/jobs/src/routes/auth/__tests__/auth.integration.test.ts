/* eslint-disable ts/ban-ts-comment */
import { testClient } from "hono/testing";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { describe, expect } from "vitest";

import env from "@/env";
import { ZOD_ERROR_MESSAGES } from "@/lib/constants";
import createApp from "@/lib/create-app";

import router from "../auth.index";
import { it } from "./fixtures";

const client = testClient(createApp().route("/", router));

describe("auth routes / integration test", () => {
  it("post /auth/verify validates the body when verifying", async ({ authRegisteredUser }) => {
    const { email } = authRegisteredUser;
    const response = await client.auth.verify.$post(
      {
        // @ts-expect-error
        json: {
          email,
        },
      },
    );
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("password");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.REQUIRED);
    }
  });

  it("post /auth/verify return 401 when password is wrong", async ({ authRegisteredUser }) => {
    const { email, password } = authRegisteredUser;
    const wrongPassword = `${password}:wrong`;
    const response = await client.auth.verify.$post(
      {
        json: {
          email,
          password: wrongPassword,
        },
      },
    );
    expect(response.status).toBe(401);
    if (response.status === 401) {
      const json = await response.json();
      expect(json.message).toBe(HttpStatusPhrases.UNAUTHORIZED);
    }
  });

  it("post /auth/verify return 401 when email is wrong", async ({ authRegisteredUser }) => {
    const { email, password } = authRegisteredUser;
    const wrongEmail = `${email}wrong`;
    const response = await client.auth.verify.$post(
      {
        json: {
          email: wrongEmail,
          password,
        },
      },
    );
    expect(response.status).toBe(401);
    if (response.status === 401) {
      const json = await response.json();
      expect(json.message).toBe(HttpStatusPhrases.UNAUTHORIZED);
    }
  });

  it("post /auth/verify return user info when credentials are correct", async ({ authRegisteredUser }) => {
    const { email, password } = authRegisteredUser;
    const response = await client.auth.verify.$post(
      {
        json: {
          email,
          password,
        },
      },
    );
    if (response.status === 200) {
      const json = await response.json();
      expect(json.email).toBe(authRegisteredUser.email);
    }
  });

  it("post /auth/register return user info when payload submited", async ({ authUnregisteredUser }) => {
    const { email, password } = authUnregisteredUser;
    const response = await client.auth.register.$post(
      {
        json: {
          email,
          password,
        },
      },
    );
    if (response.status === 200) {
      const json = await response.json();
      expect(json.email).toBe(authUnregisteredUser.email);
    }
  });

  it("post /auth/register validates the body when verifying", async ({ authUnregisteredUser }) => {
    const { email } = authUnregisteredUser;
    const response = await client.auth.verify.$post(
      {
        // @ts-expect-error
        json: {
          email,
        },
      },
    );
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("password");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.REQUIRED);
    }
  });
});
