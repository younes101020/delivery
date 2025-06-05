"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Truck } from "lucide-react";
import { Suspense } from "react";

import { Skeleton } from "@/app/_components/ui/skeleton";
import { useFetch } from "@/app/_lib/fetch-provider";

import type { OngoingDeployments } from "../_lib/queries";

import { DeploymentPreviewCard } from "./deployment-preview-card";
import { EmptyDeployment } from "./empty-deployment";
import { SubscribeToSSE } from "./subscribe-to-sse";

interface OngoingDeploymentListProps {
  baseUrl: string;
}

export function OngoingDeploymentList({ baseUrl }: OngoingDeploymentListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative z-10 py-10">
      <Suspense fallback={<PendingDeployment />}>
        <OngoingDeploymentPreview baseUrl={baseUrl} />
      </Suspense>
    </div>
  );
}

function OngoingDeploymentPreview({ baseUrl }: OngoingDeploymentListProps) {
  const { fetcher } = useFetch();
  const ongoingDeployments = useSuspenseQuery<OngoingDeployments>({
    queryKey: ["deployments", "ongoing"],
    queryFn: () => fetcher("/api/deployments/ongoing"),
  });

  if (ongoingDeployments.data.length < 1)
    return <EmptyDeployment title="No ongoing deployment" description="You can preview all your ongoing deployments here." Icon={Truck} />;

  return ongoingDeployments.data.map(deployment => (
    <SubscribeToSSE key={deployment.id} baseUrl={baseUrl} repoName={deployment.repoName}>
      <DeploymentPreviewCard {...deployment} />
    </SubscribeToSSE>
  ));
}

function PendingDeployment() {
  return (
    <Skeleton className="h-60" />
  );
}
