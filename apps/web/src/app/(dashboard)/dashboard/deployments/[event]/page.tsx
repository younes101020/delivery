import { publicEnv } from "@/env";
import { Suspense } from "react";
import { Stepper } from "./_components/stepper";

export default function DeploymentsPage({ params }: { params: Promise<{ event: string }> }) {
  return (
    <Suspense>
      <SuspensedDeploymentsPage params={params} />
    </Suspense>
  );
}

async function SuspensedDeploymentsPage({ params }: { params: Promise<{ event: string }> }) {
  const { event } = await params;
  return (
    <div className="h-full flex justify-center items-center py-4">
      <Stepper eventName={event} baseUrl={publicEnv.NEXT_PUBLIC_BASEURL} />
    </div>
  );
}
