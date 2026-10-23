"use client";

import type { Dictionary, Locale } from "@delivery/i18n";

import { createContext, useContext } from "react";

interface OnboardingDictionaryContextValue {
  locale: Locale;
  onboarding: Dictionary["onboarding"];
}

const OnboardingDictionaryContext = createContext<OnboardingDictionaryContextValue | null>(null);

export function OnboardingDictionaryProvider({ children, locale, onboarding }: React.PropsWithChildren<OnboardingDictionaryContextValue>) {
  return <OnboardingDictionaryContext.Provider value={{ locale, onboarding }}>{children}</OnboardingDictionaryContext.Provider>;
}

export function useOnboardingDictionary() {
  const context = useContext(OnboardingDictionaryContext);
  if (!context)
    throw new Error("useOnboardingDictionary must be used within OnboardingDictionaryProvider");
  return context.onboarding;
}

export function useOptionalOnboardingDictionary() {
  return useContext(OnboardingDictionaryContext)?.onboarding;
}
