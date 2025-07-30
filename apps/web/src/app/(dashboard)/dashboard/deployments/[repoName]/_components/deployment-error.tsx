"use client";

import { Suspense } from "react";

import { Separator } from "@/app/_components/ui/separator";
import { Skeleton } from "@/app/_components/ui/skeleton";

import type { OngoingDeploymentData } from "../../types";

import { RedeployButton } from "./redeploy-button";

interface DeploymentErrorProps {
  data: OngoingDeploymentData;
}

export function DeploymentError({ data }: DeploymentErrorProps) {
  return (
    <div className="flex flex-col gap-2 bg-destructive/60 p-4">
      <p className="text-destructive-foreground font-semibold">Unable to deploy your application</p>
      <Separator />
      <p className="text-xs text-destructive-foreground">Once you think you have resolved the issue, you can redeploy.</p>
      {data?.jobId
      && (
        <Suspense fallback={<PendingRedeployButton />}>
          <RedeployButton jobId={data.jobId} />
        </Suspense>
      )}
    </div>
  );
}

function PendingRedeployButton() {
  return (
    <Skeleton className="h-10 w-32" />
  );
}
