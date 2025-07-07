import { testClient } from "hono/testing";
import { describe, expect } from "vitest";

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

  it("delete /users/team/{id} return 404 when the user is not member of the team", async ({ randomRegisteredTeamId }) => {
    const response = await client.users.team[":id"].$delete(
      {
        param: {
          id: randomRegisteredTeamId,
        },
        json: {
          revokedUserId: 55555555,
        },
      },
    );
    expect(response.status).toBe(404);
  });

  it("delete /users/team/{id} return 204 when the user is revoked from team", async ({ randomRegisteredTeamMember }) => {
    const response = await client.users.team[":id"].$delete(
      {
        param: {
          id: randomRegisteredTeamMember.teamId.toString(),
        },
        json: {
          revokedUserId: randomRegisteredTeamMember.userId,
        },
      },
    );
    expect(response.status).toBe(204);
  });
});
