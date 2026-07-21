import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import { rbacMiddleware } from "@/middlewares/rbac";

const tags = ["Docker Hub"];

export const pullImageSchema = z.object({
  image: z.string().trim().min(1),
});

export const pull = createRoute({
  path: "/hub/pull",
  method: "post",
  description: "Pull a Docker image onto the configured Docker host.",
  request: {
    body: jsonContentRequired(pullImageSchema, "The Docker image to pull."),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(pullImageSchema, "Docker image pulled successfully."),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(pullImageSchema),
      "The validation error(s)",
    ),
  },
  middleware: rbacMiddleware,
});

export type PullRoute = typeof pull;
