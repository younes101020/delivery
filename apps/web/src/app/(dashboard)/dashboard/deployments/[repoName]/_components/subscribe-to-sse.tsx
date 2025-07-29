"use client";

import { type ReactNode, Suspense } from "react";

import { Skeleton } from "@/app/_components/ui/skeleton";
import { useQuerySubscription } from "@/app/_hooks/use-query-subscription";

import type { DeploymentLogState } from "../../types";

import { useGetRepoName } from "../_hooks/use-get-repo-name";

interface SubscribeToSSEProps {
  children: ReactNode;
  baseUrl: string;
}

export function SubscribeToSSE({ children, baseUrl }: SubscribeToSSEProps) {
  return (
    <Suspense fallback={<PendingStepper />}>
      <SuspendedSubscribeToSSE baseUrl={baseUrl}>
        {children}
      </SuspendedSubscribeToSSE>
    </Suspense>
  );
}

function SuspendedSubscribeToSSE({
  children,
  baseUrl,
}: SubscribeToSSEProps) {
  const repoName = useGetRepoName();

  const stateCallback = (data: DeploymentLogState, prevData: DeploymentLogState) => {
    const shouldMergeLogs = "logs" in data && data.logs && prevData && "logs" in prevData && prevData.logs;
    return shouldMergeLogs ? { ...data, logs: prevData.logs ? `${prevData.logs}${data.logs}` : data.logs } : data;
  };

  useQuerySubscription<DeploymentLogState>(`/sse-proxy/deployments/logs/${repoName}`, baseUrl, stateCallback);
  return <>{children}</>;
}

function PendingStepper() {
  return <Skeleton className="h-60 rounded-full w-full" />;
}
