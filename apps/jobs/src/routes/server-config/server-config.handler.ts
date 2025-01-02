import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import { db } from "@/db";
import { systemConfig } from "@/db/schema";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/lib/constants";

import type { GetFirstRoute, PatchRoute } from "./server-config.route";

export const getFirst: AppRouteHandler<GetFirstRoute> = async (c) => {
  const systemconfig = await db.query.systemConfig.findFirst();

  if (!systemconfig) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(systemconfig, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const updates = c.req.valid("json");

  if (Object.keys(updates).length === 0) {
    return c.json(
      {
        success: false,
        error: {
          issues: [
            {
              code: ZOD_ERROR_CODES.INVALID_UPDATES,
              path: [],
              message: ZOD_ERROR_MESSAGES.NO_UPDATES,
            },
          ],
          name: "ZodError",
        },
      },
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  const [systemconfig] = await db
    .update(systemConfig)
    .set(updates)
    .where(eq(systemConfig.id, db.select({ id: systemConfig.id }).from(systemConfig).limit(1)))
    .returning();

  if (!systemconfig) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(systemconfig, HttpStatusCodes.OK);
};
