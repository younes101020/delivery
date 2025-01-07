import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, SlugParamsSchema } from "stoker/openapi/schemas";

import { deploymentTrackerIdentifier, insertDeploymentSchema, slugParamsSchema } from "@/db/dto";
import { goneSchema, notFoundSchema } from "@/lib/constants";

const tags = ["Deployments"];

export const create = createRoute({
  path: "/deployments",
  method: "post",
  request: {
    body: jsonContentRequired(insertDeploymentSchema, "The deployment to create"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      deploymentTrackerIdentifier,
      "Unique identifier to let you track queue events",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Github application not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertDeploymentSchema),
      "The validation error(s)",
    ),
  },
});

export const streamLog = createRoute({
  path: "/deployments/logs/{slug}",
  method: "get",
  tags,
  request: {
    params: SlugParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: {
      content: {
        "text/event-stream": {
          schema: z.unknown(),
        },
      },
      description: "The build process logs of the Docker image",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "No active deployment found"),
    [HttpStatusCodes.GONE]: jsonContent(goneSchema, "Deployment has already been processed"),
  },
});

export type StreamRoute = typeof streamLog;
export type CreateRoute = typeof create;
