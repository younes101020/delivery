import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

import { PageDescription } from "@/app/_components/ui/page-description";
import { PageTitle } from "@/app/_components/ui/page-title";
import { Separator } from "@/app/_components/ui/separator";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { getQueryClient } from "@/app/_lib/get-rsc-query-client";
import { env } from "@/env";

import { OngoingDeploymentList } from "./_components/ongoing-deployment-list";
import { PreviousDeploymentList } from "./_components/previous-deployment-list";
import { getCurrentDeploymentsState, getPreviousDeploymentsState } from "./_lib/queries";

export const dynamic = "force-dynamic";

export default function DeploymentsPage() {
  return (
    <section className="p-5 bg-background/50 border flex flex-col gap-3">
      <Suspense fallback={<PendingDeployments />}>
        <Deployments />
      </Suspense>
    </section>
  );
}

async function Deployments() {
  const queryClient = getQueryClient();
  const baseUrl = env.WEB_BASE_URL;

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["deployments", "previous"],
      queryFn: getPreviousDeploymentsState,
    }),
    queryClient.prefetchQuery({
      queryKey: ["deployments", "ongoing"],
      queryFn: getCurrentDeploymentsState,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div>
        <PageTitle>Ongoing deployments</PageTitle>
        <PageDescription>A list of all your deployments in progress.</PageDescription>
        <OngoingDeploymentList baseUrl={baseUrl} />

      </div>
      <Separator className="my-4" />
      <div>
        <PageTitle>Previous deployments</PageTitle>
        <PageDescription>A list of all your previous deployments.</PageDescription>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 py-10">
          <PreviousDeploymentList />
        </div>
      </div>
    </HydrationBoundary>
  );
}

function PendingDeployments() {
  return <Skeleton className="h-full w-full" />;
}
