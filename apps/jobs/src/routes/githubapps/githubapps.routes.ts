import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

import { insertGithubAppsSchema, selectGithubAppsSchema } from "@/db/schema";
import { notFoundSchema } from "@/lib/constants";

const tags = ["Githubapps"];

export const create = createRoute({
  path: "/githubapps",
  method: "post",
  request: {
    body: jsonContentRequired(
      insertGithubAppsSchema.extend({ privateKey: z.string() }),
      "The github app to create",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectGithubAppsSchema, "The created github app"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertGithubAppsSchema.extend({ privateKey: z.string() })),
      "The validation error(s)",
    ),
  },
});

export const getOne = createRoute({
  path: "/githubapps/{id}",
  method: "get",
  request: {
    params: IdParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectGithubAppsSchema, "The requested github app"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Github app not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid id error",
    ),
  },
});

export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
