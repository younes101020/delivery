import { Bird } from "lucide-react";
import { Suspense } from "react";

import { EmptyState } from "@/app/_components/ui/empty-state";
import { PageTitle } from "@/app/_components/ui/page-title";
import { Separator } from "@/app/_components/ui/separator";
import { Skeleton } from "@/app/_components/ui/skeleton";

import { DeploymentPreviewCard } from "./_components/deployment-preview-card";
import { PreviousDeploymentPreviewCard } from "./_components/previous-deployment-card";
import { getCurrentDeploymentsState, getPreviousDeploymentsState } from "./_lib/queries";

export default async function DeploymentsPage() {
  return (
    <section className="p-5 bg-background/50 border flex flex-col gap-3">
      <div>
        <PageTitle>Ongoing deployments</PageTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative z-10 py-10">
          <Suspense fallback={<Skeleton className="w-full h-16" />}>
            <OngoingDeploymentPreview />
          </Suspense>
        </div>
      </div>
      <Separator className="my-4" />
      <div>
        <PageTitle>Previous deployments</PageTitle>
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
    return <NoDeployments title="No ongoing deployment" description="You can preview all your ongoing deployments here." />;

  return deployments.map(deployment => (
    <DeploymentPreviewCard key={deployment.id} {...deployment} />
  ));
}

async function PreviousDeployment() {
  const deployments = await getPreviousDeploymentsState();

  if (deployments.length < 1)
    return <NoDeployments title="No previous deployment" description="You can preview all your previous deployments here." />;

  return deployments.map(deployment => (
    <PreviousDeploymentPreviewCard key={deployment.id} {...deployment} />
  ));
}

function NoDeployments({ title, description }: { title: string; description: string }) {
  return (
    <div className="h-full flex justify-center items-center">
      <EmptyState
        title={title}
        description={description}
        icons={[Bird]}
      />
    </div>

  );
}
