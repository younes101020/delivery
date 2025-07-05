import { testClient } from "hono/testing";
import { describe, expect, expectTypeOf } from "vitest";

import createApp from "@/lib/create-app";

import router from "../invitation.index";
import { it } from "./fixtures";

const client = testClient(createApp().route("/", router));

describe("invitation routes / integration test", () => {
  it("get /users/team/{id}/invitation return 422 when team id params is missing", async () => {
    const response = await client.users.team[":id"].invitation.$get(
      {
        // @ts-expect-error testing purpose
        param: {},
      },
    );
    expect(response.status).toBe(422);
  });

  it("get /users/team/{id}/invitation return team invitations", async ({ randomRegisteredTeamId }) => {
    const response = await client.users.team[":id"].invitation.$get({
      param: {
        id: randomRegisteredTeamId,
      },
      query: {
        status: undefined,
      },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expectTypeOf(json)
        .toEqualTypeOf<
        Array<{
          status: string;
          id: number;
          teamId: number;
          email: string;
          role: string;
          invitedBy: number;
          invitedAt: string;
        }>
      >();
    }
  });
});
