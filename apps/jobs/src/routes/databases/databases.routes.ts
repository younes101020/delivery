import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import { createDatabaseSchema, createDatabaseSchemaResp } from "@/db/dto/databases.dto";

const tags = ["Databases"];

export const create = createRoute({
  path: "/databases",
  method: "post",
  description: "Allow you to start new database instance in a containerized environment",
  request: {
    body: jsonContentRequired(createDatabaseSchema, "The database to create"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createDatabaseSchemaResp,
      "Indicates that the database startup process has begun",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(createDatabaseSchema),
      "The validation error(s)",
    ),
  },
});

export const streamCurrentDatabase = createRoute({
  path: "/databases",
  method: "post",
  description: "Fetch the status and state of databases in the process of starting.",
  request: {
    body: jsonContentRequired(createDatabaseSchema, "The database to create"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: {
      content: {
        "text/event-stream": {
          schema: z.unknown(),
        },
      },
      description: "Databases in the process of starting",
    },
  },
});

export type CreateRoute = typeof create;
