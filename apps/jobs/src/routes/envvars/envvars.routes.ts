import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import {
  insertEnvironmentVariablesSchema,
  selectEnvironmentVariablesSchema,
} from "@/db/dto/envvars.dto";

const tags = ["Envvars"];

export const create = createRoute({
  path: "/envvars",
  method: "post",
  request: {
    body: jsonContentRequired(
      insertEnvironmentVariablesSchema,
      "The environment variable to create",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectEnvironmentVariablesSchema,
      "The created environment variable",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertEnvironmentVariablesSchema),
      "The validation error(s)",
    ),
  },
});

export type CreateRoute = typeof create;
