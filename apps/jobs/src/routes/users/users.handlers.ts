import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/auth";

import type { CreateRoute, GetOneRoute } from "./users.routes";

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const user = c.req.valid("json");
  const passwordHash = await hashPassword(user.passwordHash);
  const [inserted] = await db
    .insert(users)
    .values({ ...user, passwordHash })
    .returning();
  return c.json(inserted, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const user = await db.query.users
    .findFirst({
      where(fields, operators) {
        return operators.eq(fields.id, id);
      },
    })
    .then((user) => {
      if (user) {
        const { passwordHash, ...rest } = user;
        return rest;
      }
      return null;
    });

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
