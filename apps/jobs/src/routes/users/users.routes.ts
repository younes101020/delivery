import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import { insertUsersSchema, selectUsersSchema } from "@/db/schema";

const tags = ["Users"];

export const create = createRoute({
  path: "/users",
  method: "post",
  request: {
    body: jsonContentRequired(insertUsersSchema, "The user to create"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectUsersSchema, "The created user"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertUsersSchema),
      "The validation error(s)",
    ),
  },
});

export type CreateRoute = typeof create;
