"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { History } from "lucide-react";
import { Suspense } from "react";

import { Skeleton } from "@/app/_components/ui/skeleton";
import { useFetch } from "@/app/_lib/fetch-provider";

import type { PreviousDeployments } from "../_lib/queries";

import { EmptyDeployment } from "./empty-deployment";
import { PreviousDeploymentPreviewCard } from "./previous-deployment-card";

export function PreviousDeploymentList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10 py-10">
      <Suspense fallback={<Skeleton className="w-full h-16" />}>
        <List />
      </Suspense>
    </div>
  );
}

function List() {
  const { fetcher } = useFetch();
  const prevDeployments = useSuspenseQuery<PreviousDeployments>({
    queryKey: ["deployments", "previous"],
    queryFn: () => fetcher("/api/deployments/previous"),
  });

  if (prevDeployments.data.length < 1)
    return <EmptyDeployment title="No previous deployment" description="You can preview all your previous deployments here." Icon={History} />;

  return (
    <>
      {prevDeployments.data.map(deployment => (
        <PreviousDeploymentPreviewCard key={deployment.id} {...deployment} />
      ))}
    </>
  );
}
