import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import { requiredAuthSchema, selectUserSchema } from "@/db/dto/auth.dto";
import { unauthorizedSchema } from "@/lib/constants";

const tags = ["Auth"];

export const verify = createRoute({
  path: "/auth",
  method: "post",
  request: {
    body: jsonContentRequired(requiredAuthSchema, "The authentication credentials"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectUserSchema, "The authenticated user"),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(unauthorizedSchema, "Invalid user credentials"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(requiredAuthSchema),
      "The validation error(s)",
    ),
  },
});

export type VerifyRoute = typeof verify;
