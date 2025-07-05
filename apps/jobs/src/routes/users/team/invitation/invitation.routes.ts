import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

import { InvitationSearchParam, selectInvitationsSchema } from "./lib/dto";

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

export type GetTeamInvitation = typeof getTeamInvitation;
