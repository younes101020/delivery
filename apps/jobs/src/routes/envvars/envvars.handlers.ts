import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import { createEnvironmentVariable } from "@/lib/queries/queries";

import type { CreateRoute } from "./envvars.routes";

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const environmentVariable = c.req.valid("json");
  const inserted = await createEnvironmentVariable(environmentVariable);
  return c.json(inserted, HttpStatusCodes.OK);
};
