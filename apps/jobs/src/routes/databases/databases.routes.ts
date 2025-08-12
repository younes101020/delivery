import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import { notFoundSchema } from "@/lib/constants";
import { rbacMiddleware } from "@/middlewares/rbac";

import { createDatabaseSchema, DatabaseParamsSchema, databaseSchema } from "./lib/dto";

const tags = ["Databases"];

export const create = createRoute({
  path: "/databases",
  method: "post",
  description: "Allow you to start new database instance in a containerized environment.",
  request: {
    body: jsonContentRequired(createDatabaseSchema, "The database to create."),
  },
  tags,
  responses: {
    [HttpStatusCodes.ACCEPTED]: {
      description: "Database creation request accepted",
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(createDatabaseSchema),
      "The validation error(s)",
    ),
  },
  middleware: rbacMiddleware,
});

export const list = createRoute({
  path: "/databases",
  method: "get",
  description: "Fetch the list of running databases.",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.array(databaseSchema), "List of running database."),
  },
});

export const streamCurrentDatabase = createRoute({
  path: "/databases/ongoing",
  method: "get",
  description: "Stream real-time updates about databases that are currently being created, started or stopped.",
  tags,
  responses: {
    [HttpStatusCodes.OK]: {
      content: {
        "text/event-stream": {
          schema: z.object({
            id: z.string(),
            timestamp: z.number(),
            database: z.string(),
            status: z.enum(["completed", "failed", "stopped"]),
          }),
        },
      },
      description: "Stream of database creation/startup/stop status updates",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "No databases are currently being created, started or stopped"),
  },
});

export const stop = createRoute({
  path: "/databases/{id}/stop",
  method: "post",
  description: "Stop a running database service.",
  request: {
    params: DatabaseParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.ACCEPTED]: {
      description: "Database service stop request accepted",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Database service not found"),
  },
  middleware: rbacMiddleware,
});

export const start = createRoute({
  path: "/databases/{id}/start",
  method: "post",
  description: "Start a stopped database service.",
  request: {
    params: DatabaseParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.ACCEPTED]: {
      description: "Database service start request accepted",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Database service not found"),
  },
  middleware: rbacMiddleware,
});

export const remove = createRoute({
  path: "/databases/{id}",
  method: "delete",
  description: "Remove a database service.",
  request: {
    params: DatabaseParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.ACCEPTED]: {
      description: "Database service removal request accepted",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Database service not found"),
  },
  middleware: rbacMiddleware,
});

export type CreateRoute = typeof create;
export type ListRoute = typeof list;
export type StreamCurrentDatabaseRoute = typeof streamCurrentDatabase;
export type StopRoute = typeof stop;
export type StartRoute = typeof start;
export type RemoveRoute = typeof remove;
