import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import { insertDeploymentSchema, selectApplicationsSchema } from "@/db/dto/applications.dto";

const tags = ["Deployments"];

export const create = createRoute({
  path: "/deployments",
  method: "post",
  request: {
    body: jsonContentRequired(insertDeploymentSchema, "The deployment to create"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectApplicationsSchema, "The created deployment"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertDeploymentSchema),
      "The validation error(s)",
    ),
  },
});

export type CreateRoute = typeof create;
