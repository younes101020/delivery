import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import { createDatabaseSchema, databaseLinkSchema, databaseSchema } from "@/db/dto/databases.dto";
import { notFoundSchema } from "@/lib/constants";

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
  description: "Stop a running database container.",
  request: {
    params: z.object({
      id: z.string().describe("The ID of the database container to stop"),
    }),
  },
  tags,
  responses: {
    [HttpStatusCodes.ACCEPTED]: {
      description: "Database container stop request accepted",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Database container not found"),
  },
});

export const start = createRoute({
  path: "/databases/{id}/start",
  method: "post",
  description: "Start a stopped database container.",
  request: {
    params: z.object({
      id: z.string().describe("The ID of the database container to start"),
    }),
  },
  tags,
  responses: {
    [HttpStatusCodes.ACCEPTED]: {
      description: "Database container start request accepted",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Database container not found"),
  },
});

export const link = createRoute({
  path: "/databases/{id}/link",
  method: "post",
  description: "Link a database container to an application, the database url environment variable will be injected into the application.",
  request: {
    params: z.object({
      id: z.string().describe("The ID of the database container to link"),
    }),
    body: jsonContentRequired(databaseLinkSchema, "The application to link to the database",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: {
      description: "Database container linked to the application",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Database container not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(
        z.object({
          id: z.string().describe("The ID of the database container to link"),
        })
          .or(databaseLinkSchema),
      ),
      "The validation error(s)",
    ),
  },
});

export type CreateRoute = typeof create;
export type ListRoute = typeof list;
export type StreamCurrentDatabaseRoute = typeof streamCurrentDatabase;
export type StopRoute = typeof stop;
export type StartRoute = typeof start;
export type LinkRoute = typeof link;
