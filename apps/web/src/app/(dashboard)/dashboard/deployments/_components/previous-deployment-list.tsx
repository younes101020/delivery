"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { History } from "lucide-react";
import { Suspense } from "react";

import { Skeleton } from "@/app/_components/ui/skeleton";
import { useDeploymentsDictionary } from "@/app/_ctx/resources-dictionary";
import { useFetch } from "@/app/_lib/fetch-provider";

import type { PreviousDeployments } from "../_lib/queries";

import { EmptyDeployment } from "./empty-deployment";
import { PreviousDeploymentPreviewCard } from "./previous-deployment-card";

export function PreviousDeploymentList() {
  return (
    <Suspense fallback={<Skeleton className="w-full h-16" />}>
      <List />
    </Suspense>
  );
}

function List() {
  const deployments = useDeploymentsDictionary();
  const { fetcher } = useFetch();
  const prevDeployments = useSuspenseQuery<PreviousDeployments>({
    queryKey: ["deployments", "previous"],
    queryFn: () => fetcher("/api/deployments/previous"),
  });

  if (prevDeployments.data.length < 1)
    return <EmptyDeployment title={deployments.noPreviousTitle} description={deployments.noPreviousDescription} Icon={History} />;

  return (
    <>
      {prevDeployments.data.map(deployment => (
        <PreviousDeploymentPreviewCard key={deployment.id} {...deployment} />
      ))}
    </>
  );
}
