import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import { signToken, verifyToken } from "@/app/_lib/session";
import { parseSetCookie } from "@/lib/utils";

const protectedRoutes = "/dashboard";
const onboardingRoute = "/onboarding";

export const runtime = "nodejs";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("session");
  const onboardingCookie = request.cookies.get("skiponboarding");
  const isProtectedRoute = pathname.startsWith(protectedRoutes);
  const isOnboardingRoute = pathname.startsWith(onboardingRoute);

  const res = NextResponse.next();

  if (!onboardingCookie)
    await forwardOnboardingStatus(res);

  const forwardedOnboardingCookie = res.cookies.get("skiponboarding");

  if (onboardingCookie || forwardedOnboardingCookie) {
    const skiponboarding
      = onboardingCookie?.value === "true" || forwardedOnboardingCookie?.value === "true";
    if (isOnboardingRoute && skiponboarding) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    else if (!skiponboarding && !isOnboardingRoute) {
      return NextResponse.redirect(new URL(onboardingRoute, request.url));
    }
  }

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
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
    }
    catch (error) {
      console.error("Error updating session:", error);
      res.cookies.delete("session");
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};

/**
 * If no onboarding cookie exists, this function fetches the onboarding completion status from the jobs API
 * and forwards it to the client as a cookie
 */
async function forwardOnboardingStatus(res: NextResponse) {
  // TODO: wait for nextjs middleware to be nodejs compatible (https://github.com/vercel/next.js/discussions/71727) to use `serverEnv.AUTH_SECRET`
  // + replace fetch by trpc implementation
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
