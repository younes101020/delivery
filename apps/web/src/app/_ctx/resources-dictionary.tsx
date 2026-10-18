"use client";

import type { Dictionary, Locale } from "@delivery/i18n";

import { createContext, useContext } from "react";

interface ResourcesDictionaryContextValue {
  locale: Locale;
  resources: Dictionary["resources"];
}

const ResourcesDictionaryContext = createContext<ResourcesDictionaryContextValue | null>(null);

export function ResourcesDictionaryProvider({ children, locale, resources }: React.PropsWithChildren<ResourcesDictionaryContextValue>) {
  return <ResourcesDictionaryContext.Provider value={{ locale, resources }}>{children}</ResourcesDictionaryContext.Provider>;
}

export function useResourcesDictionary() {
  const context = useContext(ResourcesDictionaryContext);
  if (!context)
    throw new Error("useResourcesDictionary must be used within ResourcesDictionaryProvider");
  return context;
}
