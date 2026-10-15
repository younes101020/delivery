import type en from "./dictionaries/en.json";

export type AuthDictionary = typeof en.auth;
export interface Dictionary {
  auth: AuthDictionary;
}

export const LOCALES = ["en", "fr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export function hasLocale(locale: string): locale is Locale {
  return LOCALES.includes(locale as Locale);
}
