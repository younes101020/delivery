import type { NextRequest } from "next/server";

import { DEFAULT_LOCALE, hasLocale, LOCALES } from "@delivery/i18n";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { NextResponse } from "next/server";

import { LOCALE_COOKIE, LOCALE_HEADER, localizePath } from "@/app/_lib/locale";
import { checkSession } from "@/app/_lib/session";
import { shouldSkipOnboarding } from "@/app/(onboarding)/onboarding/middleware";
import { apiMiddleware } from "@/app/api/middleware";

function getLocale(request: NextRequest) {
  const savedLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (savedLocale && hasLocale(savedLocale))
    return savedLocale;

  const languages = new Negotiator({
    headers: { "accept-language": request.headers.get("accept-language") ?? "" },
  }).languages();

  return match(languages, LOCALES, DEFAULT_LOCALE);
}

function localizedUrl(request: NextRequest, locale: string, pathname: string) {
  return new URL(localizePath(locale, pathname), request.url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api"))
    return apiMiddleware(request);

  const [, possibleLocale, ...pathSegments] = pathname.split("/");
  if (!hasLocale(possibleLocale)) {
    const locale = getLocale(request);
    const url = localizedUrl(request, locale, pathname);
    url.search = request.nextUrl.search;
    return NextResponse.redirect(url);
  }

  const locale = possibleLocale;
  const internalPathname = `/${pathSegments.join("/")}`.replace(/\/$/, "") || "/";
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, locale);
  const internalUrl = request.nextUrl.clone();
  internalUrl.pathname = internalPathname;

  const response = NextResponse.rewrite(internalUrl, {
    request: { headers: requestHeaders },
  });
  response.cookies.set(LOCALE_COOKIE, locale, { path: "/", sameSite: "lax" });

  const isDashboardRoute = internalPathname.startsWith("/dashboard");
  const isOnboardingRoute = internalPathname.startsWith("/onboarding");
  const sessionCookie = request.cookies.get("session");

  if (isDashboardRoute) {
    const skipOnboarding = await shouldSkipOnboarding(request, response);
    if (!skipOnboarding)
      return NextResponse.redirect(localizedUrl(request, locale, "/onboarding"));

    try {
      await checkSession(request);
    }
    catch {
      return NextResponse.redirect(localizedUrl(request, locale, "/"));
    }
    return response;
  }

  if (isOnboardingRoute) {
    const isAuthenticationStep = !request.nextUrl.searchParams.get("step");
    const skipOnboarding = await shouldSkipOnboarding(request, response);
    if (skipOnboarding)
      return NextResponse.redirect(localizedUrl(request, locale, "/"));

    if (!sessionCookie && !isAuthenticationStep) {
      const url = localizedUrl(request, locale, "/onboarding/verify");
      url.searchParams.set("redirectTo", `${localizePath(locale, internalPathname)}${request.nextUrl.search}`);
      return NextResponse.redirect(url);
    }

    if (!sessionCookie)
      return response;

    try {
      await checkSession(request);
      if (isAuthenticationStep) {
        const url = localizedUrl(request, locale, "/onboarding");
        url.searchParams.set("step", "2");
        return NextResponse.redirect(url);
      }
    }
    catch {
      return NextResponse.redirect(localizedUrl(request, locale, "/"));
    }

    return response;
  }

  const skipOnboarding = await shouldSkipOnboarding(request, response);
  if (!skipOnboarding)
    return NextResponse.redirect(localizedUrl(request, locale, "/onboarding"));

  if (!sessionCookie)
    return response;

  try {
    await checkSession(request);
    return NextResponse.redirect(localizedUrl(request, locale, "/dashboard/applications"));
  }
  catch {
    return NextResponse.redirect(localizedUrl(request, locale, "/"));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
