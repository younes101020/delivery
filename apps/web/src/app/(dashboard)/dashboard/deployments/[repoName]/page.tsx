import { Suspense } from "react";

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
    <section className="h-full flex justify-center items-center py-4">
      <Stepper repoName={repoName} />
    </section>
  );
}
