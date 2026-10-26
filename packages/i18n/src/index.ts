import type en from "./dictionaries/en.json";

export type AuthDictionary = typeof en.auth;
export type ResourcesDictionary = typeof en.resources;
export type SettingsDictionary = typeof en.settings;
export type DeploymentsDictionary = typeof en.deployments;
export type OnboardingDictionary = typeof en.onboarding;
export type NavigationDictionary = typeof en.navigation;
export interface Dictionary {
  auth: AuthDictionary;
  resources: ResourcesDictionary;
  settings: SettingsDictionary;
  deployments: DeploymentsDictionary;
  onboarding: OnboardingDictionary;
  navigation: NavigationDictionary;
}

export const LOCALES = ["en", "fr", "es", "de"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export function hasLocale(locale: string): locale is Locale {
  return LOCALES.includes(locale as Locale);
}
