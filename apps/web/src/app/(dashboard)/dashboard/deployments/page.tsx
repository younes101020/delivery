import { Bird } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { env } from "@/env";

import { DeploymentPreviewCard } from "./_components/deployment-preview-card";
import { getCurrentDeploymentsState } from "./_lib/queries";

function NoDeployments() {
  return (
    <div className="h-full flex justify-center items-center">
      <EmptyState
        title="No ongoing deployment"
        description="You can preview all your ongoing deployments here."
        icons={[Bird]}
        action={{
          label: "Deploy application",
          href: "/applications/new",
        }}
      />
    </div>

  );
}

export default async function DeploymentsPage() {
  const deployments = await getCurrentDeploymentsState();

  if (!deployments || deployments.length < 1)
    return <NoDeployments />;

  return (
    <section className="p-5 bg-background/50 border">
      <h1 className="text-3xl font-bold tracking-wide">Ongoing deployments</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative z-10 py-10">
        {deployments.map(deployment => (
          <DeploymentPreviewCard key={deployment.id} {...deployment} baseUrl={env.NEXT_PUBLIC_BASEURL} />
        ))}
      </div>
    </section>
  );
}
