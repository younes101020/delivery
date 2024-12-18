import { signToken, verifyToken } from "@/lib/auth/session";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { parseSetCookie } from "./lib/utils";

const protectedRoutes = "/dashboard";
const onboardingRoute = "/onboarding";

export const runtime = "nodejs";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("session");
  const onboardingCookie = request.cookies.get("skiponboarding");
  const isProtectedRoute = pathname.startsWith(protectedRoutes);
  const isOnboardingRoute = pathname.startsWith(onboardingRoute);

  let res = NextResponse.next();

  if (!onboardingCookie) await forwardOnboardingStatus(res);

  if (onboardingCookie) {
    const skiponboarding = JSON.parse(onboardingCookie.value);
    if (!skiponboarding && !isOnboardingRoute) {
      return NextResponse.redirect(new URL(onboardingRoute, request.url));
    }
  }

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
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
    } catch (error) {
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
  const response = await fetch(process.env.JOBS_API_BASEURL!);
  const headers = Object.fromEntries(response.headers);
  const cookie = parseSetCookie(headers["set-cookie"]);
  res.cookies.set({
    name: "skiponboarding",
    value: cookie.skiponboarding,
    maxAge: parseInt(cookie["max-age"]),
    path: cookie["path"],
  });
}
