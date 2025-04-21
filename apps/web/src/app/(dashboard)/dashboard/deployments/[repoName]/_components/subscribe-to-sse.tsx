"use client";

import type { ReactNode } from "react";

import { usePathname } from "next/navigation";

import { useQuerySubscription } from "@/app/_hooks/use-query-subscription";

import type { DeploymentLogState } from "../types";

interface SubscribeToSSEProps {
  children: ReactNode;
}

export function SubscribeToSSE({ children }: SubscribeToSSEProps) {
  const path = usePathname();
  const repoName = path.split("/").slice(2)[0];

  const stateCallback = (data: DeploymentLogState, prevData: DeploymentLogState) => {
    const shouldMergeLogs = "logs" in data && data.logs && "logs" in prevData && prevData.logs;
    return shouldMergeLogs ? { ...data, logs: prevData.logs ? `${prevData.logs}${data.logs}` : data.logs } : data;
  };

  useQuerySubscription<DeploymentLogState>(`/deployments-proxy/logs/${repoName}`, stateCallback);
  return <>{children}</>;
}
