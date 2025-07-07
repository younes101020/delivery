import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

import { notFoundSchema } from "@/lib/constants";

import { revokedUserTeamSchema, selectUserTeamWithMembersSchema } from "./lib/dto";

const tags = ["Users", "Team"];

export const getUserTeam = createRoute({
  path: "/users/{id}/team",
  method: "get",
  description: "Retrieve the user team data and members",
  request: {
    params: IdParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectUserTeamWithMembersSchema, "The requested user team"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "User team not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid id error",
    ),
  },
});

export const revokeUserTeam = createRoute({
  path: "/users/team/{id}",
  method: "delete",
  description: "Revoke the user from the team.",
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(revokedUserTeamSchema, "The id of the revoked user."),
  },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "User successfully revoked from the team.",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "User or team not found."),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema).or(createErrorSchema(revokedUserTeamSchema)),
      "Validation error(s)",
    ),
  },
});

export type GetUserTeamRoute = typeof getUserTeam;
export type RevokeUserTeamRoute = typeof revokeUserTeam;
