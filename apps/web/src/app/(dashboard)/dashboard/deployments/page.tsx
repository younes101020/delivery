import type { LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

import { History, Truck } from "lucide-react";
import { Suspense } from "react";

import { EmptyState } from "@/app/_components/ui/empty-state";
import { PageDescription } from "@/app/_components/ui/page-description";
import { PageTitle } from "@/app/_components/ui/page-title";
import { Separator } from "@/app/_components/ui/separator";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { SubscribeToSSE } from "@/app/(dashboard)/dashboard/deployments/_components/subscribe-to-sse";

import { DeploymentPreviewCard } from "./_components/deployment-preview-card";
import { PreviousDeploymentPreviewCard } from "./_components/previous-deployment-card";
import { getCurrentDeploymentsState, getPreviousDeploymentsState } from "./_lib/queries";

export default async function DeploymentsPage() {
  return (
    <section className="p-5 bg-background/50 border flex flex-col gap-3">
      <div>
        <PageTitle>Ongoing deployments</PageTitle>
        <PageDescription>A list of all your deployments in progress.</PageDescription>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative z-10 py-10">
          <Suspense fallback={<Skeleton className="w-full h-16" />}>
            <OngoingDeploymentPreview />
          </Suspense>
        </div>
      </div>
      <Separator className="my-4" />
      <div>
        <PageTitle>Previous deployments</PageTitle>
        <PageDescription>A list of all your previous deployments.</PageDescription>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10 py-10">
          <Suspense fallback={<Skeleton className="w-full h-16" />}>
            <PreviousDeployment />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

async function OngoingDeploymentPreview() {
  const deployments = await getCurrentDeploymentsState();

  if (deployments.length < 1)
    return <NoDeployments title="No ongoing deployment" description="You can preview all your ongoing deployments here." Icon={Truck} />;

  return deployments.map(deployment => (
    <SubscribeToSSE key={deployment.id} repoName={deployment.repoName}>
      <DeploymentPreviewCard {...deployment} />
    </SubscribeToSSE>
  ));
}

async function PreviousDeployment() {
  const deployments = await getPreviousDeploymentsState();

  if (deployments.length < 1)
    return <NoDeployments title="No previous deployment" description="You can preview all your previous deployments here." Icon={History} />;

  return deployments.map(deployment => (
    <PreviousDeploymentPreviewCard key={deployment.id} {...deployment} />
  ));
}

function NoDeployments({ title, description, Icon }: { title: string; description: string; Icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>> }) {
  return (
    <div className="h-full flex justify-center items-center md:col-span-2 lg:col-span-3 xl:col-span-4">
      <EmptyState
        title={title}
        description={description}
        icons={[Icon]}
      />
    </div>
  );
}
