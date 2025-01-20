import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

import { deploymentTrackerIdentifier, insertDeploymentSchema, jobSchema, slugParamsSchema } from "@/db/dto";
import { goneSchema, notFoundSchema, okSchema } from "@/lib/constants";

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
    params: slugParamsSchema,
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

export const list = createRoute({
  path: "/deployments/jobs",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(
        z.any()//jobSchema
      ),
      "The list of  failed and active jobs",
    ),
  },
});

export const retryJob = createRoute({
  path: "/deployments/jobs/retry/{slug}",
  method: "post",
  tags,
  request: {
    params: slugParamsSchema,
    body: jsonContentRequired(
      slugParamsSchema,
      "The queue name to which the job belongs",
    ),
  },
  description: "Retry launching a failed or completed job",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(okSchema, "Job retry attempted"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "No failed or completed job found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(slugParamsSchema).or(createErrorSchema(IdParamsSchema)),
      "The validation error(s)",
    ),
  },
});

export type StreamRoute = typeof streamLog;
export type CreateRoute = typeof create;
export type RetryRoute = typeof retryJob;
export type ListRoute = typeof list;
