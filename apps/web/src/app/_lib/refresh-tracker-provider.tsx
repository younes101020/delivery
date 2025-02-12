"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";

import { createContext, useContext, useState } from "react";

interface RefreshTrackerContextType {
  setRefreshTracker: Dispatch<SetStateAction<null | boolean>>;
  refreshTracker: null | boolean;
}

const RefreshTrackerContext = createContext<RefreshTrackerContextType | null>(null);

export function useRefreshTracker(): RefreshTrackerContextType {
  const context = useContext(RefreshTrackerContext);
  if (context === null) {
    throw new Error("useRefreshTracker must be used within a RefreshTrackerProvider");
  }
  return context;
}

export function RefreshTrackerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [refreshTracker, setRefreshTracker] = useState<null | boolean>(null);

  return <RefreshTrackerContext.Provider value={{ setRefreshTracker, refreshTracker }}>{children}</RefreshTrackerContext.Provider>;
}
