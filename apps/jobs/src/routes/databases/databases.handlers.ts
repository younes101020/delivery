import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import type { CreateRoute } from "./databases.routes";

import { startDatabase } from "./lib/tasks/start-database";

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const databaseJobData = c.req.valid("json");
  await startDatabase(databaseJobData);
  return c.json({ success: true }, HttpStatusCodes.OK);
};
