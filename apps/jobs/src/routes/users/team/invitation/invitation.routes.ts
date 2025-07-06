import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

import { createInvitationsSchema, InvitationSearchParam, selectInvitationSchema, selectInvitationsSchema } from "./lib/dto";

const tags = ["Users", "Team", "Invitation"];

export const getTeamInvitation = createRoute({
  path: "/users/team/{id}/invitation",
  method: "get",
  description: "Retrieve team invitation state and data.",
  request: {
    params: IdParamsSchema,
    query: InvitationSearchParam,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectInvitationsSchema, "The requested invitation"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(InvitationSearchParam).or(createErrorSchema(IdParamsSchema)),
      "The validation error(s)",
    ),
  },
});

export const createTeamInvitation = createRoute({
  path: "/users/team/{id}/invitation",
  method: "post",
  description: "Create invitation to join team.",
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(createInvitationsSchema, "The invitation"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectInvitationSchema, "The created invitation"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(createInvitationsSchema).or(createErrorSchema(IdParamsSchema)),
      "The validation error(s)",
    ),
  },
});

export type GetTeamInvitation = typeof getTeamInvitation;
export type CreateTeamInvitation = typeof createTeamInvitation;
