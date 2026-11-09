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
export declare const LOCALES: readonly ["en", "fr", "es", "de"];
export type Locale = (typeof LOCALES)[number];
export declare const DEFAULT_LOCALE: Locale;
export declare function hasLocale(locale: string): locale is Locale;
//# sourceMappingURL=index.d.ts.map