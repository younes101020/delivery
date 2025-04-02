import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import { authRegisterSchema, authVerifySchema, selectUserSchema } from "@/db/dto";
import { unauthorizedSchema } from "@/lib/constants";

const tags = ["Auth"];

export const verify = createRoute({
  path: "/auth/verify",
  method: "post",
  request: {
    body: jsonContentRequired(authVerifySchema, "The authentication credentials"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectUserSchema, "The authenticated user"),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(unauthorizedSchema, "Invalid user credentials"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(authVerifySchema),
      "The validation error(s)",
    ),
  },
});

export const register = createRoute({
  path: "/auth/register",
  method: "post",
  request: {
    body: jsonContentRequired(authRegisterSchema, "The user informations"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectUserSchema, "The registered user"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(authRegisterSchema),
      "The validation error(s)",
    ),
  },
});

export type VerifyRoute = typeof verify;
export type RegisterRoute = typeof register;
