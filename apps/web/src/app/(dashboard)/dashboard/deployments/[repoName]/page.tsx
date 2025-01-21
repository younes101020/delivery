import { Suspense } from "react";

import { publicEnv } from "@/env";

import { Stepper } from "./_components/stepper";

export default function DeploymentPage({ params }: { params: Promise<{ repoName: string }> }) {
  return (
    <Suspense>
      <SuspensedDeploymentsPage params={params} />
    </Suspense>
  );
}

async function SuspensedDeploymentsPage({ params }: { params: Promise<{ repoName: string }> }) {
  const { repoName } = await params;
  return (
    <div className="h-full flex justify-center items-center py-4">
      <Stepper repoName={repoName} baseUrl={publicEnv.NEXT_PUBLIC_BASEURL} />
    </div>
  );
}
