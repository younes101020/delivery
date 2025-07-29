"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

import type { Nullable } from "@/app/_lib/utils";

import { Button } from "@/app/_components/ui/button";
import { Separator } from "@/app/_components/ui/separator";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { getQueryClient } from "@/app/_lib/react-query-provider";

import type { DeploymentLogState } from "../../types";

import { DeploymentLogsCard } from "../../_components/deployment-logs";
import { RedeployButton } from "./redeploy-button";
import BoxReveal from "./ui/box-reveal";
import Ripple from "./ui/ripple";

export type DeploymentData = Nullable<{
  jobName: keyof typeof DEPLOYMENTMETADATA;
  logs?: string;
  isCriticalError?: boolean;
  jobId?: string;
  appId?: string;
  completed?: boolean;
}>;

export const DEPLOYMENTMETADATA = {
  clone: {
    phrase: "We clone your GitHub repo to your server",
    position: "1 / 3",
  },
  build: {
    phrase: "We deploy your application",
    position: "2 / 3",
  },
  configure: {
    phrase: "We configure your application",
    position: "3 / 3",
  },
};

export function Stepper() {
  const { data } = useQuery<DeploymentLogState>({ queryKey: ["deployment"] }, getQueryClient(true));

  if (data && "completed" in data)
    return <FinishDeployment appId={data.appId} />;

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden gap-4">
      <div className="w-[50rem] flex flex-col">
        {data?.jobName && (
          <BoxReveal duration={0.5}>
            <p className="text-xl font-medium tracking-tighter">
              {DEPLOYMENTMETADATA[data?.jobName].phrase}
              <span className="text-primary">.</span>
            </p>
          </BoxReveal>
        )}

        <div className="flex flex-col">
          <Separator />
          <p className="text-xs text-primary-foreground bg-primary size-fit px-1 self-end">
            {data?.jobName && DEPLOYMENTMETADATA[data.jobName].position}
          </p>
        </div>

      </div>

      <DeploymentLogsCard logs={data?.logs} />

      {data?.isCriticalError && (
        <div className="flex flex-col gap-2 text-center items-center">
          <p className="text-destructive font-semibold">We were unable to deploy your application</p>
          <p className="text-xs text-destructive">Once you think you have resolved the issue, you can redeploy.</p>
          {data?.jobId
          && (
            <Suspense fallback={<PendingRedeployButton />}>
              <RedeployButton jobId={data.jobId} />
            </Suspense>
          )}
        </div>
      )}
      <Ripple />
    </div>
  );
}

interface FinishDeploymentProps {
  appId: number;
}

function FinishDeployment({ appId }: FinishDeploymentProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-2">
      <h3>Deployment Finished</h3>
      <Button onClick={() => router.push(`/dashboard/applications/${appId}`)}>
        Go to application settings
      </Button>
    </div>
  );
}

function PendingRedeployButton() {
  return (
    <Skeleton className="h-10 w-32" />
  );
}
