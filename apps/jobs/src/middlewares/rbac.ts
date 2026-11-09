import { verifyToken } from "@delivery/auth";
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import env from "@/env";

export const rbacMiddleware = createMiddleware(async (c, next) => {
  if (env.NODE_ENV === "test")
    return next();

  if (c.get("apiKey"))
    return next();

  const token = getCookie(c, "session");
  const session = await verifyToken(token || "")
    .catch(() => {
      throw new HTTPException(403, { message: "Your session is invalid or expired." });
    });

  c.set("sessionUser", session.user);

  if (session.user.role !== "owner")
    throw new HTTPException(403, { message: "You do not have permission to do this." });

  await next();
});
