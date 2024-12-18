import type { Context, Next } from "hono";

import { getCookie, setCookie } from "hono/cookie";

import { db } from "@/db";

export async function onboardingFlag(c: Context, next: Next) {
  const onboardingCookie = getCookie(c, "skiponboarding");
  await next();
  if (!onboardingCookie) {
    const systemConfig = await db.query.systemConfig.findFirst();
    const onboardingCompleted = systemConfig?.onboardingCompleted ?? false;
    setCookie(c, "skiponboarding", onboardingCompleted.toString(), {
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  }
}
