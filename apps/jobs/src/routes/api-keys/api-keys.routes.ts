import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

import { rbacMiddleware } from "@/middlewares/rbac";

import { apiKeySchema, createApiKeySchema, createdApiKeySchema } from "./lib/dto";

const tags = ["API keys"];

export const list = createRoute({
  path: "/api-keys",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.array(apiKeySchema), "The team's API keys"),
  },
  middleware: rbacMiddleware,
});

export const create = createRoute({
  path: "/api-keys",
  method: "post",
  request: {
    body: jsonContentRequired(createApiKeySchema, "The API key name and selected scopes"),
  },
  tags,
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(createdApiKeySchema, "The created API key; its token is only returned once"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(createApiKeySchema), "Validation error"),
  },
  middleware: rbacMiddleware,
});

export const revoke = createRoute({
  path: "/api-keys/{id}",
  method: "delete",
  request: {
    params: IdParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "API key revoked",
    },
    [HttpStatusCodes.NOT_FOUND]: {
      description: "API key not found",
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(IdParamsSchema), "Invalid API key id"),
  },
  middleware: rbacMiddleware,
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type RevokeRoute = typeof revoke;
