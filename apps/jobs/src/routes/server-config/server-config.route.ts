import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

import { notFoundSchema } from "@/lib/constants";
import { rbacMiddleware } from "@/middlewares/rbac";
import { patchServerConfigSchema, patchServerWebServiceConfigSchema, selectServerConfigSchema, selectServerWebServiceConfigSchema } from "@/routes/server-config/lib/dto/server-config.dto";

const tags = ["Server configuration"];

export const getFirst = createRoute({
  path: "/serverconfig",
  description: "Get the server configuration state and domain name.",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectServerConfigSchema, "The server configuration"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Server configuration not found"),
  },
});

export const patch = createRoute({
  path: "/serverconfig",
  method: "patch",
  description: "Update the server configuration state and domain name.",
  request: {
    body: jsonContentRequired(patchServerConfigSchema, "The server configuration updates"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectServerConfigSchema, "The updated server configuration"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Server configuration not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchServerConfigSchema),
      "The validation error(s)",
    ),
  },
  middleware: rbacMiddleware,
});

export const getWebService = createRoute({
  path: "/serverconfig/web-service",
  method: "get",
  description: "Get the configuration of the delivery dashboard service",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectServerWebServiceConfigSchema, "Delivery web service configuration details"),
  },
});

export const patchWebService = createRoute({
  path: "/serverconfig/web-service/{id}",
  method: "patch",
  description: "Update the configuration of the delivery dashboard service",
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(patchServerWebServiceConfigSchema, "The delivery web service updates"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: {
      description: "Web service configuration updated",
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchServerWebServiceConfigSchema),
      "The validation error(s)",
    ),
  },
  middleware: rbacMiddleware,
});

export type PatchRoute = typeof patch;
export type GetFirstRoute = typeof getFirst;
export type PatchServiceRoute = typeof patchWebService;
export type GetServiceRoute = typeof getWebService;
