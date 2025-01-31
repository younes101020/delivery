import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import { getUserByEmail, setUser } from "@/db/queries/queries";
import { hashPassword, verifyPassword } from "@/lib/auth";

import type { RegisterRoute, VerifyRoute } from "./auth.routes";

export const verify: AppRouteHandler<VerifyRoute> = async (c) => {
  const { email, password } = c.req.valid("json");

  const user = await getUserByEmail(email);

  if (!user) {
    return c.json(
      {
        message: HttpStatusPhrases.UNAUTHORIZED,
      },
      HttpStatusCodes.UNAUTHORIZED,
    );
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);

  if (!isValidPassword) {
    return c.json(
      {
        message: HttpStatusPhrases.UNAUTHORIZED,
      },
      HttpStatusCodes.UNAUTHORIZED,
    );
  }

  const { passwordHash, ...userWithoutPassword } = user;

  return c.json(userWithoutPassword, HttpStatusCodes.OK);
};

export const register: AppRouteHandler<RegisterRoute> = async (c) => {
  const user = c.req.valid("json");
  const passwordHash = await hashPassword(user.password);
  const { password, ...userWithoutNotHashedPassword } = user;
  const inserted = await setUser(userWithoutNotHashedPassword, passwordHash);
  return c.json(inserted, HttpStatusCodes.OK);
};
