import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

import { PageDescription } from "@/app/_components/ui/page-description";
import { PageTitle } from "@/app/_components/ui/page-title";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { getQueryClient } from "@/app/_lib/get-rsc-query-client";

import { getApplicationByName } from "../_lib/queries";
import { ApplicationConfiguration } from "./_components/app-configuration";
import { ApplicationDetails } from "./_components/app-details";
import { ApplicationOptions } from "./_components/app-options";

interface ApplicationPageProps {
  params: Promise<{ name: string }>;
}

export default function ApplicationPage({ params }: ApplicationPageProps) {
  return (
    <section className="p-5 bg-background/50 border">
      <div className="flex justify-between">
        <div>
          <PageTitle>Application configuration</PageTitle>
          <PageDescription>
            Configure your application settings from here.
          </PageDescription>
        </div>
        <ApplicationOptions />
      </div>

      <div className="mt-8 grid grid-cols-4 gap-4">
        <Suspense fallback={<PendingApplication />}>
          <Application params={params} />
        </Suspense>
      </div>
    </section>
  );
}

async function Application({ params }: ApplicationPageProps) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["applications", "details"],
    queryFn: () => getApplicationByName(params),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ApplicationConfiguration />
      <ApplicationDetails />
    </HydrationBoundary>
  );
}

function PendingApplication() {
  return <Skeleton className="h-full w-full" />;
}
