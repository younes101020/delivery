import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

import { versionSchema } from "./lib/dto/version.dto";

const tags = ["Version"];

export const getVersion = createRoute({
  path: "/version",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      versionSchema,
      "Delivery version information",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({
        message: z.string(),
      }),
      "Delivery service specification not found",
    ),
  },
});

export type GetVersionRoute = typeof getVersion;
