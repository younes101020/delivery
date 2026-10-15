import { DEFAULT_LOCALE, hasLocale } from "@delivery/i18n";
import { headers } from "next/headers";

export const LOCALE_HEADER = "x-delivery-locale";
export const LOCALE_COOKIE = "delivery-locale";

export async function getCurrentLocale() {
  const locale = (await headers()).get(LOCALE_HEADER);

  return locale && hasLocale(locale) ? locale : DEFAULT_LOCALE;
}

export function localizePath(locale: string, pathname: string) {
  const normalizedPathname = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `/${locale}${normalizedPathname}`;
}
