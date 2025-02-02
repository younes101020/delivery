import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import { selectScreenshotSchema, selectUrlScreenshotSchema } from "@/db/dto/screenshots.dto";
import { notFoundSchema } from "@/lib/constants";

const tags = ["Website screenshot"];

export const getImageUrl = createRoute({
  path: "/screenshots",
  description: "Use this endpoint to upload the screenshot image of a website; it will return a public link to the image.",
  method: "post",
  request: {
    body: jsonContentRequired(
      selectScreenshotSchema,
      "the website URL to take the screenshot from and the id of the application",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectUrlScreenshotSchema, "The uploaded image url"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Application not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(selectScreenshotSchema), "The validation error(s)"),
  },
});

export type GetImageUrl = typeof getImageUrl;
