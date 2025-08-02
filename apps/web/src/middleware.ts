import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import { checkSession } from "@/app/_lib/session";

import { dashboardMiddleware } from "./app/(dashboard)/dashboard/middleware";
import { onboardingMiddleware } from "./app/(onboarding)/onboarding/middleware";
import { apiMiddleware } from "./app/api/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isApiRoute = pathname.startsWith("/api");
  const isOnboardingRoute = pathname.startsWith("/onboarding");
  const isDashboardRoute = pathname.startsWith("/dashboard");

  if (isDashboardRoute)
    return dashboardMiddleware(request);
  if (isOnboardingRoute)
    return onboardingMiddleware(request);
  if (isApiRoute)
    return apiMiddleware(request);

  const res = NextResponse.next();

  try {
    await checkSession(request);
    // Redirect to the dashboard if the user is authenticated
    if (!isDashboardRoute)
      return NextResponse.redirect(new URL("/dashboard/applications", request.url));
  }
  catch (error) {
    console.error("Error checking session in middleware:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }

  return res;
}

export const config = {
  matcher: [
    {
      source: "/",
      has: [
        {
          type: "cookie",
          key: "session",
        },
      ],
    },
    {
      source: "/api/:path*",
    },
    {
      source: "/onboarding/:path*",
    },
    {
      source: "/dashboard/:path*",
    },
  ],
};
