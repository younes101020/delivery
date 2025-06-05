import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

import { notFoundSchema } from "@/lib/constants";

import { selectUserTeamWithMembersSchema } from "./lib/dto";

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

export type GetUserTeamRoute = typeof getUserTeam;
