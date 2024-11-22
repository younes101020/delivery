import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import {
  insertApplicationsSchema,
  selectApplicationsSchema,
} from "@/db/schema";

const tags = ["Applications"];

export const create = createRoute({
  path: "/applications",
  method: "post",
  request: {
    body: jsonContentRequired(
      insertApplicationsSchema,
      "The application to create",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectApplicationsSchema,
      "The created application",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertApplicationsSchema),
      "The validation error(s)",
    ),
  },
});

export type CreateRoute = typeof create;
