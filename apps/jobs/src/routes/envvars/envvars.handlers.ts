import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import {db} from "@/db";

import { environmentVariables } from "@/db/schema";
import type { CreateRoute } from "./envvars.routes";

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const environmentVariable = c.req.valid("json");
  const [inserted] = await db
    .insert(environmentVariables)
    .values(environmentVariable)
    .returning();
  return c.json(inserted, HttpStatusCodes.OK);
};
