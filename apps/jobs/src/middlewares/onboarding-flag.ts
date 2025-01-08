import type { Context, Next } from "hono";

import { getCookie, setCookie } from "hono/cookie";

import { getSystemConfig } from "@/db/queries";

export async function onboardingFlag(c: Context, next: Next) {
  const onboardingCookie = getCookie(c, "skiponboarding");
  await next();
  if (!onboardingCookie) {
    const systemConfig = await getSystemConfig();
    const onboardingCompleted = systemConfig?.onboardingCompleted ?? false;
    setCookie(c, "skiponboarding", onboardingCompleted.toString(), {
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  }
}
