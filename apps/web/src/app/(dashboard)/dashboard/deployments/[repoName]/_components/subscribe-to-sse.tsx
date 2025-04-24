"use client";

import type { ReactNode } from "react";

import { useQuerySubscription } from "@/app/_hooks/use-query-subscription";

import type { DeploymentLogState } from "../types";

import { useGetRepoName } from "../_hooks/use-get-repo-name";

interface SubscribeToSSEProps {
  children: ReactNode;
}

export function SubscribeToSSE({ children }: SubscribeToSSEProps) {
  const repoName = useGetRepoName();

  const stateCallback = (data: DeploymentLogState, prevData: DeploymentLogState) => {
    const shouldMergeLogs = "logs" in data && data.logs && "logs" in prevData && prevData.logs;
    return shouldMergeLogs ? { ...data, logs: prevData.logs ? `${prevData.logs}${data.logs}` : data.logs } : data;
  };

  useQuerySubscription<DeploymentLogState>(`/deployments-proxy/logs/${repoName}`, stateCallback);
  return <>{children}</>;
}
