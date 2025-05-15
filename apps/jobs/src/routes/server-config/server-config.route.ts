import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import { patchServerConfigSchema, patchServerInstanceConfigSchema, selectServerConfigSchema, selectServerInstanceConfigSchema } from "@/db/dto/server-config.dto";
import { notFoundSchema } from "@/lib/constants";

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
});

export const getInstance = createRoute({
  path: "/serverconfig/instance",
  method: "get",
  description: "Get the configuration of the delivery dashboard instance",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectServerInstanceConfigSchema, "Delivery web instance configuration details"),
  },
});

export const patchInstance = createRoute({
  path: "/serverconfig/instance",
  method: "patch",
  description: "Update the configuration of the delivery dashboard instance",
  request: {
    body: jsonContentRequired(patchServerInstanceConfigSchema, "The delivery web instance updates"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: {
      description: "Web instance configuration updated",
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchServerInstanceConfigSchema),
      "The validation error(s)",
    ),
  },
});

export type PatchRoute = typeof patch;
export type GetFirstRoute = typeof getFirst;
export type PatchInstanceRoute = typeof patchInstance;
export type GetInstanceRoute = typeof getInstance;
