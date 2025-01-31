import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

import {
  insertApplicationWithSharedEnv,
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

export const create = createRoute({
  path: "/applications",
  method: "post",
  request: {
    body: jsonContentRequired(insertApplicationWithSharedEnv, "The application to create"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(IdParamsSchema, "The created application identifier"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertApplicationWithSharedEnv),
      "The validation error(s)",
    ),
  },
});

export const getOne = createRoute({
  path: "/applications/{id}",
  method: "get",
  request: {
    params: IdParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectApplicationsSchemaWithSharedEnv,
      "The requested application",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Application not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid id error",
    ),
  },
});

export const patch = createRoute({
  path: "/applications/{id}",
  method: "patch",
  request: {
    params: IdParamsSchema,
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
      createErrorSchema(patchApplicationsSchema).or(createErrorSchema(IdParamsSchema)),
      "The validation error(s)",
    ),
  },
});

export const remove = createRoute({
  path: "/applications/{id}",
  method: "delete",
  request: {
    params: IdParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "Application deleted",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Application not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid id error",
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      internalServerSchema,
      "Failed to clean up application files and Docker resources via SSH",
    ),
  },
});

export type ListRoute = typeof list;
export type PatchRoute = typeof patch;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type RemoveRoute = typeof remove;
