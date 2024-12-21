import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

import {
  insertGithubAppsSchema,
  patchGithubAppsSchema,
  selectGithubAppsSchema,
} from "@/db/dto/githubapps.dto";
import { notFoundSchema } from "@/lib/constants";

const tags = ["Githubapps"];

export const list = createRoute({
  path: "/githubapps",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectGithubAppsSchema.extend({ privateKey: z.string() })),
      "The list of githubapps",
    ),
  },
});

export const create = createRoute({
  path: "/githubapps",
  method: "post",
  request: {
    body: jsonContentRequired(insertGithubAppsSchema, "The github app to create"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectGithubAppsSchema, "The created github app"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertGithubAppsSchema),
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
    [HttpStatusCodes.OK]: jsonContent(
      selectGithubAppsSchema.extend({ privateKey: z.string() }),
      "The requested github app",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Github app not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid id error",
    ),
  },
});

export const patch = createRoute({
  path: "/githubapps/{id}",
  method: "patch",
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(patchGithubAppsSchema, "The githubapps updates"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectGithubAppsSchema, "The updated githubapps"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Githubapps not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchGithubAppsSchema).or(createErrorSchema(IdParamsSchema)),
      "The validation error(s)",
    ),
  },
});

export type ListRoute = typeof list;
export type PatchRoute = typeof patch;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
