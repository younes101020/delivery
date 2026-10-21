import type en from "./dictionaries/en.json";

export type AuthDictionary = typeof en.auth;
export type ResourcesDictionary = typeof en.resources;
export type SettingsDictionary = typeof en.settings;
export type DeploymentsDictionary = typeof en.deployments;
export interface Dictionary {
  auth: AuthDictionary;
  resources: ResourcesDictionary;
  settings: SettingsDictionary;
  deployments: DeploymentsDictionary;
}

export const LOCALES = ["en", "fr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export function hasLocale(locale: string): locale is Locale {
  return LOCALES.includes(locale as Locale);
}
