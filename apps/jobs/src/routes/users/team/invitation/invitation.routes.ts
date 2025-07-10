import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

import { notFoundSchema } from "@/lib/constants";

import { approvedInvitationSchema, createInvitationsSchema, InvitationSearchParam, selectInvitationSchema, selectInvitationsSchema } from "./lib/dto";

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

export const approveInvitation = createRoute({
  path: "/users/team/invitation/{id}",
  method: "patch",
  description: "Approve an invitation to join a team.",
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(approvedInvitationSchema, "The email of the invited user"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectInvitationSchema, "The approved invitation"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(approvedInvitationSchema).or(createErrorSchema(IdParamsSchema)),
      "The validation error(s)",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Invitation or invited user not found."),

  },
});

export type GetTeamInvitation = typeof getTeamInvitation;
export type CreateTeamInvitation = typeof createTeamInvitation;
export type ApproveInvitation = typeof approveInvitation;
