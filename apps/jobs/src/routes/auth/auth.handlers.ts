import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import type { RegisterRoute, VerifyRoute } from "./auth.routes";

import { isValidUser, registerUser } from "./lib/services";

export const verify: AppRouteHandler<VerifyRoute> = async (c) => {
  const { email, password } = c.req.valid("json");

  const user = await isValidUser({ email, password });

  if (!user) {
    return c.json(
      {
        message: HttpStatusPhrases.UNAUTHORIZED,
      },
      HttpStatusCodes.UNAUTHORIZED,
    );
  }

  return c.json(user, HttpStatusCodes.OK);
};

export const register: AppRouteHandler<RegisterRoute> = async (c) => {
  const user = c.req.valid("json");
  const userSessionPayload = await registerUser(user);

  return c.json(userSessionPayload, HttpStatusCodes.OK);
};
