import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

import { insertUsersSchema, selectUsersSchema } from "@/db/schema";
import { notFoundSchema } from "@/lib/constants";

const tags = ["Users"];

export const create = createRoute({
  path: "/users",
  method: "post",
  request: {
    body: jsonContentRequired(insertUsersSchema, "The user to create"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectUsersSchema, "The created user"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertUsersSchema),
      "The validation error(s)",
    ),
  },
});

export const getOne = createRoute({
  path: "/users/{id}",
  method: "get",
  request: {
    params: IdParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectUsersSchema, "The requested user"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "User not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid id error",
    ),
  },
});

export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
