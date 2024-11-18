import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import {db} from "@/db";

import { users } from "@/db/schema";
import type { CreateRoute } from "./users.routes";

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const user = c.req.valid("json");
  const [inserted] = await db.insert(users).values(user).returning();
  return c.json(inserted, HttpStatusCodes.OK);
};
