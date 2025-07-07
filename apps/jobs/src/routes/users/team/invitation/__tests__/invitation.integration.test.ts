import { testClient } from "hono/testing";
import { describe, expect, expectTypeOf } from "vitest";

import createApp from "@/lib/create-app";
import { it } from "@/routes/users/__tests__/fixtures";

import router from "../invitation.index";

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

  it("post /users/team/{id}/invitation return 422 when team id params is missing", async ({ invitationPayload }) => {
    const response = await client.users.team[":id"].invitation.$post(
      {
        // @ts-expect-error testing purpose
        param: {},
        json: invitationPayload,
      },
    );
    expect(response.status).toBe(422);
  });

  it("post /users/team/{id}/invitation return 422 when invitation payload is missing", async ({ randomRegisteredTeamId }) => {
    const response = await client.users.team[":id"].invitation.$post(
      {
        param: {
          id: randomRegisteredTeamId,
        },
        // @ts-expect-error testing purpose
        json: undefined,
      },
    );
    expect(response.status).toBe(422);
  });

  it("post /users/team/{id}/invitation return created team invitations", async ({ randomRegisteredTeamId, invitationPayload }) => {
    const response = await client.users.team[":id"].invitation.$post(
      {
        param: {
          id: randomRegisteredTeamId,
        },
        json: invitationPayload,
      },
    );
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expectTypeOf(json)
        .toEqualTypeOf<{
        status: string;
        id: number;
        teamId: number;
        email: string;
        role: string;
        invitedBy: number;
        invitedAt: string;
      }>();
    }
  });

  it("patch /users/team/invitation/{id} return approved team invitations", async ({ randomRegisteredInvitation }) => {
    const response = await client.users.team.invitation[":id"].$patch(
      {
        param: {
          id: randomRegisteredInvitation.id.toString(),
        },
        json: {
          invitedUserEmail: randomRegisteredInvitation.email,
        },
      },
    );
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json).toHaveProperty("status", "accepted");
    }
  });
});
