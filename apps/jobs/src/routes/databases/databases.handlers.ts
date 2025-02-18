import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import type { CreateRoute } from "./databases.routes";

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  // const { type } = c.req.valid("json");

  return c.json({ databaseUrl: "" }, HttpStatusCodes.OK);
};
