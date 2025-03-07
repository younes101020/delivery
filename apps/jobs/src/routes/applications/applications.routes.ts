import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, SlugParamsSchema } from "stoker/openapi/schemas";

import {
  patchApplicationsSchema,
  selectApplicationsSchema,
  selectApplicationsSchemaWithSharedEnv,
} from "@/db/dto";
import { internalServerSchema, notFoundSchema } from "@/lib/constants";

const tags = ["Applications"];

export const list = createRoute({
  path: "/applications",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectApplicationsSchema),
      "The list of applications",
    ),
  },
});

export const getOne = createRoute({
  path: "/applications/{slug}",
  method: "get",
  request: {
    params: SlugParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectApplicationsSchemaWithSharedEnv,
      "The requested application",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Application not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(SlugParamsSchema),
      "Invalid slug error",
    ),
  },
});

export const patch = createRoute({
  path: "/applications/{slug}",
  method: "patch",
  request: {
    params: SlugParamsSchema,
    body: jsonContentRequired(patchApplicationsSchema, "The application updates"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectApplicationsSchemaWithSharedEnv.deepPartial(),
      "The updated application",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Application not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchApplicationsSchema).or(createErrorSchema(SlugParamsSchema)),
      "The validation error(s)",
    ),
  },
});

export const remove = createRoute({
  path: "/applications/{slug}",
  method: "delete",
  request: {
    params: SlugParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "Application deleted",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Application not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(SlugParamsSchema),
      "Invalid slug error",
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      internalServerSchema,
      "Failed to clean up application files and Docker resources via SSH",
    ),
  },
});

export type ListRoute = typeof list;
export type PatchRoute = typeof patch;
export type GetOneRoute = typeof getOne;
export type RemoveRoute = typeof remove;
