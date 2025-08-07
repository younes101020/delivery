import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import { checkSession } from "@/app/_lib/session";
import { parseSetCookie } from "@/app/_lib/utils";

export const ONBOARDING_PREFIX_ROUTE = "/onboarding";

export async function onboardingMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get("session");
  const isOnboardingRoute = pathname.startsWith(ONBOARDING_PREFIX_ROUTE);
  const isOnboardingAuthStepRoute = isOnboardingRoute && !request.nextUrl.searchParams.get("step");

  const res = NextResponse.next();

  const skiponboarding = await shouldSkipOnboarding(request, res);

  if (isOnboardingRoute && skiponboarding)
    return NextResponse.redirect(new URL("/", request.url));

  const attemptToAccessRestrictedOnboardingRoute = isOnboardingRoute && !sessionCookie && !isOnboardingAuthStepRoute;

  if (attemptToAccessRestrictedOnboardingRoute) {
    const urlSearchParams = new URLSearchParams(request.nextUrl.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    const urlParams = `?${new URLSearchParams(params)}`;
    const redirectTo = request.nextUrl.pathname + urlParams;

    return NextResponse.redirect(new URL(`${ONBOARDING_PREFIX_ROUTE}/verify?redirectTo=${redirectTo}`, request.url));
  }

  try {
    await checkSession(request);
    if (isOnboardingAuthStepRoute) {
      const onboardingUrl = new URL(ONBOARDING_PREFIX_ROUTE, request.url);
      onboardingUrl.searchParams.set("step", "2");
      return NextResponse.redirect(onboardingUrl);
    }
  }
  catch (error) {
    console.error("Error checking session in onboarding middleware:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }

  return res;
}

export async function shouldSkipOnboarding(request: NextRequest, response: NextResponse) {
  const onboardingCookie = request.cookies.get("skiponboarding");

  if (!onboardingCookie)
    await forwardOnboardingStatus(response);

  const forwardedOnboardingCookie = response.cookies.get("skiponboarding");

  return onboardingCookie?.value === "true" || forwardedOnboardingCookie?.value === "true";
}

/**
 * If no onboarding cookie exists on incoming request, this function fetches the onboarding completion status from the jobs API
 * and forwards it to the client as a cookie in the response.
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
