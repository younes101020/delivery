import { hashPassword } from "@delivery/utils";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/lib/constants";
import { getUserById, updateUser } from "@/lib/queries/queries";

import type { GetOneRoute, PatchRoute } from "./users.routes";

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const user = await getUserById(id);

  if (!user) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(user, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id } = c.req.valid("param");
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

  if (updates.password) {
    updates.password = await hashPassword(updates.password);
  }

  const updatedUser = await updateUser(id, updates);

  if (!updatedUser) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(updatedUser, HttpStatusCodes.OK);
};
