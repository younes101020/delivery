import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

import { notFoundSchema } from "@/lib/constants";
import { patchUserSchema, selectUserSchema } from "@/lib/dto/users.dto";

const tags = ["Users"];

export const getOne = createRoute({
  path: "/users/{id}",
  method: "get",
  request: {
    params: IdParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectUserSchema, "The requested user"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "User not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid id error",
    ),
  },
});

export const patch = createRoute({
  path: "/users/{id}",
  method: "patch",
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(patchUserSchema, "The user updates"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectUserSchema.pick({ id: true }), "The updated user id"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "User not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchUserSchema).or(createErrorSchema(IdParamsSchema)),
      "The validation error(s)",
    ),
  },
});

export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
