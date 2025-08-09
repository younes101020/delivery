import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import { rbacMiddleware } from "@/middlewares/rbac";

import { updatedVersionSchema, versionSchema } from "./lib/dto/version.dto";

const tags = ["Version"];

export const getVersion = createRoute({
  path: "/version",
  method: "get",
  description: "Get the current version information of Delivery instance.",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      versionSchema,
      "Delivery version information.",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
      "Delivery service specification not found.",
    ),
  },
});

export const updateVersion = createRoute({
  path: "/version",
  method: "put",
  description: "Update the Delivery instance to the latest version.",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      updatedVersionSchema,
      "Applied version.",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
      "Delivery service specification not found.",
    ),
  },
  middleware: rbacMiddleware,
});

export type GetVersionRoute = typeof getVersion;
export type UpdateVersionRoute = typeof updateVersion;
