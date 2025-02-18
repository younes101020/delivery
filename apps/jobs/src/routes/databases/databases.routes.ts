import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import { createDatabaseSchema, databaseAccess } from "@/db/dto/databases.dto";

const tags = ["Databases"];

export const create = createRoute({
  path: "/databases",
  method: "post",
  request: {
    body: jsonContentRequired(createDatabaseSchema, "The database to create"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      databaseAccess,
      "Database URL to let you plug it with applications",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(createDatabaseSchema),
      "The validation error(s)",
    ),
  },
});

export type CreateRoute = typeof create;
