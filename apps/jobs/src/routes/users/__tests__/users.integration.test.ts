import { testClient } from "hono/testing";
import { describe, expect } from "vitest";

import createApp from "@/lib/create-app";

import router from "../users.index";
import { it } from "./fixtures";

const client = testClient(createApp().route("/", router));

describe("users routes / integration test", () => {
  it("get /users/{id} return 422 when id params is missing", async () => {
    const response = await client.users[":id"].$get(
      {
        // @ts-expect-error testing purpose
        param: {},
      },
    );
    expect(response.status).toBe(422);
  });

  it("patch /users/{id} return 200", async ({ userPayload, registeredUser }) => {
    const response = await client.users[":id"].$patch(
      {
        param: {
          id: registeredUser.id.toString(),
        },
        json: {
          email: userPayload.email,
        },
      },
    );
    expect(response.status).toBe(200);
  });
});
