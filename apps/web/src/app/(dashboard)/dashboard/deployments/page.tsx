import { Bird } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";

import { DeploymentPreviewCard } from "./_components/deployment-preview-card";
import { getDeployments } from "./_lib/queries";

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
  const deployments = await getDeployments();
  if (!deployments) {
    return <NoDeployments />;
  }
  return (
    <section className="p-5 bg-background/50 border">
      <h1 className="text-3xl font-bold bg-primary text-primary-foreground w-fit">New application</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative z-10 py-10">
        {deployments.map(deployment => (
          <DeploymentPreviewCard key={deployment.id} {...deployment} />
        ))}
      </div>
    </section>
  );
}
