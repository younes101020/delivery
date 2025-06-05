"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";

import { createContext, useContext, useState } from "react";

import type { Nullable } from "../_lib/utils";

export type SelectedApplication = Nullable<{
  name: string;
  gitUrl: string;
  githubAppId: number;
  id: number;
}>;

interface DeploymentSelectedApplicationContextType {
  selectedApplication: SelectedApplication;
  setSelectedApplication: Dispatch<SetStateAction<SelectedApplication>>;
}

const DeploymentSelectedApplicationContext = createContext<DeploymentSelectedApplicationContextType | null>(null);

export function useDeploymentSelectedApplication(): DeploymentSelectedApplicationContextType {
  const context = useContext(DeploymentSelectedApplicationContext);
  if (context === null) {
    throw new Error("useDeploymentSelectedApplication must be used within a DeploymentSelectedApplicationProvider");
  }
  return context;
}

export function DeploymentSelectedApplicationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [selectedApplication, setSelectedApplication] = useState<SelectedApplication>({
    name: null,
    id: null,
    githubAppId: null,
    gitUrl: null,
  });

  return (
    <DeploymentSelectedApplicationContext.Provider value={{
      selectedApplication,
      setSelectedApplication,
    }}
    >
      {children}
    </DeploymentSelectedApplicationContext.Provider>
  );
}
