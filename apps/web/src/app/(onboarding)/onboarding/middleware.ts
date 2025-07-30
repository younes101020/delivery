import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import { parseSetCookie } from "@/app/_lib/utils";
import { PROTECTED_PREFIX_ROUTE } from "@/middleware";

export const ONBOARDING_PREFIX_ROUTE = "/onboarding";

export async function onboardingMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = pathname.startsWith(PROTECTED_PREFIX_ROUTE);
  const sessionCookie = request.cookies.get("session");
  const isOnboardingRoute = pathname.startsWith(ONBOARDING_PREFIX_ROUTE);
  const isOnboardingAuthStepRoute = isOnboardingRoute && !request.nextUrl.searchParams.get("step");
  const onboardingCookie = request.cookies.get("skiponboarding");

  const res = NextResponse.next();

  if (!onboardingCookie)
    await forwardOnboardingStatus(res);

  const forwardedOnboardingCookie = res.cookies.get("skiponboarding");

  if (onboardingCookie || forwardedOnboardingCookie) {
    const skiponboarding
      = onboardingCookie?.value === "true" || forwardedOnboardingCookie?.value === "true";

    if (isOnboardingRoute && skiponboarding)
      return NextResponse.redirect(new URL("/", request.url));

    if (!skiponboarding && !isOnboardingRoute)
      return NextResponse.redirect(new URL(ONBOARDING_PREFIX_ROUTE, request.url));

    if (!sessionCookie && !isOnboardingAuthStepRoute && isOnboardingRoute) {
      const urlSearchParams = new URLSearchParams(request.nextUrl.search);
      const params = Object.fromEntries(urlSearchParams.entries());
      const urlParams = `?${new URLSearchParams(params)}`;
      const redirectTo = request.nextUrl.pathname + urlParams;

      return NextResponse.redirect(new URL(`${ONBOARDING_PREFIX_ROUTE}/verify?redirectTo=${redirectTo}`, request.url));
    }
  }

  if (!isProtectedRoute && !isOnboardingRoute && sessionCookie) {
    return NextResponse.redirect(new URL(`${PROTECTED_PREFIX_ROUTE}/applications`, request.url));
  }
}

/**
 * If no onboarding cookie exists, this function fetches the onboarding completion status from the jobs API
 * and forwards it to the client as a cookie
 */
async function forwardOnboardingStatus(res: NextResponse) {
  // eslint-disable-next-line node/no-process-env
  const response = await fetch(process.env.JOBS_API_BASEURL!);
  const headers = Object.fromEntries(response.headers);
  const cookie = parseSetCookie(headers["set-cookie"]);
  res.cookies.set({
    name: "skiponboarding",
    value: cookie.skiponboarding,
    maxAge: Number.parseInt(cookie["max-age"]),
    path: cookie.path,
  });
}
