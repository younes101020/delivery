"use client";

import type { Dictionary, Locale } from "@delivery/i18n";

import { createContext, useContext } from "react";

interface ResourcesDictionaryContextValue {
  locale: Locale;
  resources: Dictionary["resources"];
  settings: Dictionary["settings"];
  deployments: Dictionary["deployments"];
}

const ResourcesDictionaryContext = createContext<ResourcesDictionaryContextValue | null>(null);

export function ResourcesDictionaryProvider({ children, deployments, locale, resources, settings }: React.PropsWithChildren<ResourcesDictionaryContextValue>) {
  return <ResourcesDictionaryContext.Provider value={{ deployments, locale, resources, settings }}>{children}</ResourcesDictionaryContext.Provider>;
}

export function useResourcesDictionary() {
  const context = useContext(ResourcesDictionaryContext);
  if (!context)
    throw new Error("useResourcesDictionary must be used within ResourcesDictionaryProvider");
  return context;
}

export function useSettingsDictionary() {
  return useResourcesDictionary().settings;
}

export function useDeploymentsDictionary() {
  return useResourcesDictionary().deployments;
}
