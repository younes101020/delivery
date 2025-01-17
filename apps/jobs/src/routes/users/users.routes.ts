import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

import { insertUsersSchema, patchUsersSchema, selectUsersSchema } from "@/db/dto/users.dto";
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

export const patch = createRoute({
  path: "/users/{id}",
  method: "patch",
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(patchUsersSchema, "The user updates"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectUsersSchema.pick({ id: true }), "The updated user id"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "User not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchUsersSchema).or(createErrorSchema(IdParamsSchema)),
      "The validation error(s)",
    ),
  },
});

export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
