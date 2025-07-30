"use client";

import { useQuery } from "@tanstack/react-query";

import { Skeleton } from "@/app/_components/ui/skeleton";
import { getQueryClient } from "@/app/_lib/react-query-provider";

import type { DeploymentLogState } from "../../types";

import { DeploymentLogsCard } from "../../_components/deployment-logs";
import { FinishDeployment } from "./deployment-completed";
import { DeploymentError } from "./deployment-error";
import { DeploymentLogsHeader } from "./deployment-logs-header";
import Ripple from "./ui/ripple";

export function Deployment() {
  const { data, isLoading } = useQuery<DeploymentLogState>({ queryKey: ["deployment"] }, getQueryClient(true));

  if (isLoading)
    return <PendingDeployment />;

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden gap-4">
      {data && "jobName" in data && (
        <>
          <DeploymentLogsHeader data={data} />

          <DeploymentLogsCard logs={data?.logs}>
            {data?.isCriticalError && <DeploymentError data={data} />}
          </DeploymentLogsCard>
        </>

      )}

      <Ripple />

      <div className="w-[50rem]">
        {data && "completed" in data
        && <FinishDeployment appId={data.appId} />}
      </div>

    </div>
  );
}

function PendingDeployment() {
  return (
    <div className="flex flex-col gap-4 w-[50rem]">
      <div className="flex justify-between">
        <Skeleton className="w-[40%] h-[3rem]" />
        <Skeleton className="w-[10%] h-[1rem] self-end" />
      </div>

      <Skeleton className="h-[20rem]" />
    </div>
  );
}
