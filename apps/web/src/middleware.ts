import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import { signToken, verifyToken } from "@/app/_lib/session";

import { ONBOARDING_PREFIX_ROUTE, onboardingMiddleware } from "./app/(onboarding)/onboarding/middleware";

export const PROTECTED_PREFIX_ROUTE = "/dashboard";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get("session");
  const isProtectedRoute = pathname.startsWith(PROTECTED_PREFIX_ROUTE);

  const isOnboardingRoute = pathname.startsWith(ONBOARDING_PREFIX_ROUTE);
  const isOnboardingAuthStepRoute = isOnboardingRoute && !request.nextUrl.searchParams.get("step");

  const res = NextResponse.next();

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const onboardingResponse = await onboardingMiddleware(request);

  if (onboardingResponse) {
    return onboardingResponse;
  }

  if (sessionCookie) {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

      res.cookies.set({
        name: "session",
        value: await signToken({
          ...parsed,
          expires: expiresInOneDay.toISOString(),
        }),
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        expires: expiresInOneDay,
      });

      if (isOnboardingAuthStepRoute) {
        const onboardingUrl = new URL(ONBOARDING_PREFIX_ROUTE, request.url);
        onboardingUrl.searchParams.set("step", "2");

        return NextResponse.redirect(onboardingUrl);
      }
    }
    catch (error) {
      console.error("Error updating session:", error);
      res.cookies.delete("session");
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|mockServiceWorker).*)"],
};
