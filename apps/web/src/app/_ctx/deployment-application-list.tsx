"use client";

import type { ReactNode } from "react";

import { createContext, use, useContext, useOptimistic } from "react";

import type { RepositoriesWithGithubApp, RepositoriesWithGithubAppPromise } from "../_lib/github/repositories";

interface DeploymentApplicationListContextType {
  applicationsWithGithubApps: RepositoriesWithGithubApp;
  triggerPending: () => void;
}

const DeploymentApplicationListContext = createContext<DeploymentApplicationListContextType | null>(null);

export function useDeploymentApplicationList(): DeploymentApplicationListContextType {
  const context = useContext(DeploymentApplicationListContext);
  if (context === null) {
    throw new Error("useDeploymentApplicationList must be used within a DeploymentApplicationListProvider");
  }
  return context;
}

export function DeploymentApplicationListProvider({
  children,
  repositoriesWithGithubAppPromise,
}: {
  children: ReactNode;
  repositoriesWithGithubAppPromise: RepositoriesWithGithubAppPromise;
}) {
  const repositoriesWithGithubApp = use(repositoriesWithGithubAppPromise);

  const [optimisticApplicationList, triggerPending] = useOptimistic<RepositoriesWithGithubApp, void>(
    repositoriesWithGithubApp,
    state => ({
      githubApps: state!.githubApps,
      repositories: {
        ...state!.repositories,
        isPending: true,
      },
    }),
  );

  return (
    <DeploymentApplicationListContext.Provider value={{
      applicationsWithGithubApps: optimisticApplicationList,
      triggerPending,
    }}
    >
      {children}
    </DeploymentApplicationListContext.Provider>
  );
}
