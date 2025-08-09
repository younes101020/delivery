import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

import { notFoundSchema } from "@/lib/constants";
import {
  insertGithubAppSchema,
  patchGithubAppsSchema,
  selectGithubAppsSchema,
} from "@/lib/dto/githubapps.dto";
import { rbacMiddleware } from "@/middlewares/rbac";

const tags = ["Githubapps"];

export const list = createRoute({
  path: "/githubapps",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectGithubAppsSchema.extend({ privateKey: z.string().nullable() })),
      "The list of githubapps",
    ),
  },
});

export const create = createRoute({
  path: "/githubapps",
  method: "post",
  request: {
    body: jsonContentRequired(insertGithubAppSchema, "The github app to create"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectGithubAppsSchema, "The created github app"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertGithubAppSchema),
      "The validation error(s)",
    ),
  },
  middleware: rbacMiddleware,
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
      selectGithubAppsSchema.extend({ privateKey: z.string().nullable() }),
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
  middleware: rbacMiddleware,
});

export type ListRoute = typeof list;
export type PatchRoute = typeof patch;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
