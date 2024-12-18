import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import { patchOnboardingSchema, selectOnboardingSchema } from "@/db/dto/onboarding.dto";
import { notFoundSchema } from "@/lib/constants";

const tags = ["Onboarding"];

export const patch = createRoute({
  path: "/onboarding",
  method: "patch",
  request: {
    body: jsonContentRequired(patchOnboardingSchema, "The onboarding updates"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectOnboardingSchema, "The updated system config"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Onboarding not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchOnboardingSchema),
      "The validation error(s)",
    ),
  },
});

export type PatchRoute = typeof patch;
