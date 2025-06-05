import { testClient } from "hono/testing";
import { describe, expect, expectTypeOf } from "vitest";

import createApp from "@/lib/create-app";

import { it } from "../../__tests__/fixtures";
import router from "../team.index";

const client = testClient(createApp().route("/", router));

describe("team routes / integration test", () => {
  it("get /users/{id}/team return 422 when id params is missing", async () => {
    const response = await client.users[":id"].team.$get(
      {
        // @ts-expect-error testing purpose
        param: {},
      },
    );
    expect(response.status).toBe(422);
  });

  it("get /users/{id}/team return team members", async ({ registeredUser }) => {
    const response = await client.users[":id"].team.$get(
      {
        param: {
          id: registeredUser.id.toString(),
        },
      },
    );
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expectTypeOf(json.teamMembers)
        .toEqualTypeOf<
        Array<{
          id: number;
          userId: number;
          teamId: number;
          role: string;
          joinedAt: string;
          user: {
            id: number;
            name: string;
            email: string;
          };
        }>
      >();
    }
  });

  it("get /users/{id}/team return team name", async ({ registeredUser }) => {
    const response = await client.users[":id"].team.$get(
      {
        param: {
          id: registeredUser.id.toString(),
        },
      },
    );
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expectTypeOf(json.name).toEqualTypeOf<string>();
    }
  });

  it("get /users/{id}/team return 404 when the user id is not linked to any user", async () => {
    const response = await client.users[":id"].team.$get(
      {
        param: {
          id: "55555555",
        },
      },
    );
    expect(response.status).toBe(404);
  });
});
