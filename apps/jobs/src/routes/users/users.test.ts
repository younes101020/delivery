/* eslint-disable ts/ban-ts-comment */
import { testClient } from "hono/testing";
import { describe, expect, it } from "vitest";

import env from "@/env";
import { ZOD_ERROR_MESSAGES } from "@/lib/constants";
import createApp from "@/lib/create-app";

import router from "./users.index";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

if (!env.BEARER_TOKEN) {
  throw new Error("You should provide token");
}

const client = testClient(createApp().route("/", router));
const httpOptions = {
  headers: { Authorization: `Bearer ${env.BEARER_TOKEN}` },
};

describe("users routes", () => {
  it("post /users validates the body when creating", async () => {
    const response = await client.users.$post(
      {
        // @ts-expect-error
        json: {
          email: "hello@gmail.com",
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
});

const name = "younesfkl";
const email = "hellofkl@gmail.com";
const passwordHash = "Azerty-60";

it("post /users creates a user", async () => {
  const response = await client.users.$post(
    {
      json: {
        name,
        email,
        passwordHash,
      },
    },
    httpOptions,
  );
  expect(response.status).toBe(200);
  if (response.status === 200) {
    const json = await response.json();
    expect(json.email).toBe(email);
  }
});
