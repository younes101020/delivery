"use client";

import type { ReactNode } from "react";

import { createContext, useContext } from "react";

type Fetcher = (endpoint: string) => Promise<any>;

interface FetcherContextType {
  fetcher: Fetcher;
  baseUrl: string;
}

const FetcherContext = createContext<FetcherContextType | null>(null);

export function useFetch(): FetcherContextType {
  const context = useContext(FetcherContext);
  if (context === null) {
    throw new Error("useFetch must be used within a FetcherProvider");
  }
  return context;
}

export function FetcherProvider({
  children,
  baseUrl,
}: {
  children: ReactNode;
  baseUrl: string;
}) {
  return (
    <FetcherContext.Provider value={{
      fetcher: (endpoint: string) => fetch(`${baseUrl}${endpoint}`).then(res => res.json()),
      baseUrl,
    }}
    >
      {children}
    </FetcherContext.Provider>
  );
}
