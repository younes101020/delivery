import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import { patchServerConfigSchema, selectServerConfigSchema } from "@/db/dto/server-config.dto";
import { notFoundSchema } from "@/lib/constants";

const tags = ["Server configuration"];

export const getFirst = createRoute({
  path: "/serverconfig",
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

export type PatchRoute = typeof patch;
export type GetFirstRoute = typeof getFirst;
