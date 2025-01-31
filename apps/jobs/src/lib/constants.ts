import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

export const ZOD_ERROR_MESSAGES = {
  REQUIRED: "Required",
  EXPECTED_NUMBER: "Expected number, received nan",
  NO_UPDATES: "No updates provided",
};

export const ZOD_ERROR_CODES = {
  INVALID_UPDATES: "invalid_updates",
};

export const notFoundSchema = createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND);
export const unauthorizedSchema = createMessageObjectSchema(HttpStatusPhrases.UNAUTHORIZED);
export const goneSchema = createMessageObjectSchema(HttpStatusPhrases.GONE);
export const internalServerSchema = createMessageObjectSchema(HttpStatusPhrases.INTERNAL_SERVER_ERROR);
export const okSchema = createMessageObjectSchema(HttpStatusPhrases.OK);

export const APPLICATIONS_PATH = "/data/delivery/applications";
