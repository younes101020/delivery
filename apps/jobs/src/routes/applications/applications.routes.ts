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

export const streamCurrentApplication = createRoute({
  path: "/applications/ongoing",
  method: "get",
  description: "Stream real-time updates about applications that are currently being started or stopped.",
  tags,
  responses: {
    [HttpStatusCodes.OK]: {
      content: {
        "text/event-stream": {
          schema: z.object({
            id: z.string(),
            timestamp: z.number(),
            status: z.enum(["completed", "failed", "stopped"]),
          }),
        },
      },
      description: "Stream of application startup/stop status updates",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "No applications are currently being started or stopped"),
  },
});

export const stop = createRoute({
  path: "/applications/{id}/stop",
  method: "post",
  description: "Stop a running application container.",
  request: {
    params: z.object({
      id: z.string().describe("The ID of the application container to stop"),
    }),
  },
  tags,
  responses: {
    [HttpStatusCodes.ACCEPTED]: {
      description: "Application container stop request accepted",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Application container not found"),
  },
});

export const start = createRoute({
  path: "/applications/{id}/start",
  method: "post",
  description: "Start a stopped application container.",
  request: {
    params: z.object({
      id: z.string().describe("The ID of the application container to start"),
    }),
  },
  tags,
  responses: {
    [HttpStatusCodes.ACCEPTED]: {
      description: "Application container start request accepted",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Application container not found"),
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
export type StreamCurrentApplicationRoute = typeof streamCurrentApplication;
export type StopRoute = typeof stop;
export type StartRoute = typeof start;
export type PatchRoute = typeof patch;
export type GetOneRoute = typeof getOne;
export type RemoveRoute = typeof remove;
