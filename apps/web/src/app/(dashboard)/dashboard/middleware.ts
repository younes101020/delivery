import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import { checkSession } from "@/app/_lib/session";
import { ONBOARDING_PREFIX_ROUTE, shouldSkipOnboarding } from "@/app/(onboarding)/onboarding/middleware";

export async function dashboardMiddleware(request: NextRequest) {
  const skiponboarding = await shouldSkipOnboarding(request);

  if (!skiponboarding)
    return NextResponse.redirect(new URL(ONBOARDING_PREFIX_ROUTE, request.url));

  const res = NextResponse.next();

  try {
    await checkSession(request);
  }
  catch (error) {
    console.error("Error checking session in dashboard middleware:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }

  return res;
}
