import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import { notFoundSchema } from "@/lib/constants";
import { currentJobSchema, deploymentTrackerIdentifier, insertDeploymentSchema, jobIdParamsSchema, previousJobSchema, queueSchema } from "@/lib/dto";

const tags = ["Deployments"];

export const create = createRoute({
  path: "/deployments",
  method: "post",
  request: {
    body: jsonContentRequired(insertDeploymentSchema, "The deployment to create"),
  },
  tags,
  description: "Start the deployment of an application",
  responses: {
    [HttpStatusCodes.ACCEPTED]: jsonContent(
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

export const redeploy = createRoute({
  path: "/deployments/redeploy/{queueName}",
  method: "post",
  tags,
  description: "Restart the deployment of an application. If a deployment of the same application is in progress during the redeployment attempt, the redeployment will occur after the current deployment is completed",
  request: {
    params: queueSchema,
  },
  responses: {
    [HttpStatusCodes.ACCEPTED]: jsonContent(
      deploymentTrackerIdentifier,
      "Deployment name",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertDeploymentSchema),
      "The validation error(s)",
    ),
  },
});

export const streamPreview = createRoute({
  path: "/deployments/preview/{queueName}",
  method: "get",
  tags,
  description: "Fetch the status and state of an application's deployment with SSE",
  request: {
    params: queueSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: {
      content: {
        "text/event-stream": {
          schema: z.object({
            step: z.enum(["clone", "build", "configure"]),
            status: z.enum(["active", "failed", "completed"]),
          }),
        },
      },
      description: "The deployment preview job process",
    },
  },
});

export const streamLog = createRoute({
  path: "/deployments/logs/{queueName}",
  method: "get",
  tags,
  description: "Fetch the logs of the current deployment with SSE",
  request: {
    params: queueSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: {
      content: {
        "text/event-stream": {
          schema: z.object({
            jobName: z.enum(["clone", "build", "configure"]).optional(),
            logs: z.string().optional(),
            isCriticalError: z.boolean().optional(),
            jobId: z.string().optional(),
            completed: z.boolean().optional(),
            appId: z.string().optional(),
          }),
        },
      },
      description: "The deployment logs job process",
    },
  },
});

export const getCurrentDeploymentStep = createRoute({
  path: "/deployments/jobs/ongoing",
  method: "get",
  tags,
  description: "Fetch the metadata of the ongoing deployments",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(currentJobSchema),
      "The current deployment state",
    ),
  },
});

export const getPreviousDeploymentStep = createRoute({
  path: "/deployments/jobs/previous",
  method: "get",
  tags,
  description: "Fetch the metadata of the completed deployments",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(previousJobSchema),
      "The previous deployment state",
    ),
  },
});

export const streamCurrentDeploymentCount = createRoute({
  path: "/deployments/jobs/ongoing/count",
  method: "get",
  tags,
  description: "Fetch the total number of ongoing deployments",
  responses: {
    [HttpStatusCodes.OK]: {
      content: {
        "text/event-stream": {
          schema: z.object({
            isActiveDeployment: z.boolean(),
          }),
        },
      },
      description: "The ongoings deployment count",
    },
  },
});

export const retryJob = createRoute({
  path: "/deployments/jobs/retry/{jobId}",
  method: "post",
  tags,
  request: {
    params: jobIdParamsSchema,
    body: jsonContentRequired(
      queueSchema,
      "The queue name to which the job belongs",
    ),
  },
  description: "Retry launching a failed or completed job",
  responses: {
    [HttpStatusCodes.ACCEPTED]: {
      description: "Job retry attempted",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "No failed or completed job found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(jobIdParamsSchema).or(createErrorSchema(queueSchema)),
      "The validation error(s)",
    ),
  },
});

export type StreamLogsRoute = typeof streamLog;
export type CreateRoute = typeof create;
export type RedeployRoute = typeof redeploy;
export type RetryRoute = typeof retryJob;
export type GetCurrentDeploymentStep = typeof getCurrentDeploymentStep;
export type GetPreviousDeploymentStep = typeof getPreviousDeploymentStep;
export type StreamCurrentDeploymentCount = typeof streamCurrentDeploymentCount;
export type StreamPreview = typeof streamPreview;
