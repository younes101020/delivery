import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

import { PageDescription } from "@/app/_components/ui/page-description";
import { PageTitle } from "@/app/_components/ui/page-title";
import { Separator } from "@/app/_components/ui/separator";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { getQueryClient } from "@/app/_lib/get-rsc-query-client";

import { getApplicationByName, getApplicationSreenshotUrl } from "../_lib/queries";
import { ApplicationConfiguration } from "./_components/app-configuration";
import { ApplicationDelete } from "./_components/app-delete";
import { ApplicationDetails } from "./_components/app-details";
import { ApplicationScreenshot } from "./_components/app-screenshot";

interface ApplicationPageProps {
  params: Promise<{ name: string }>;
}

export default function ApplicationPage({ params }: ApplicationPageProps) {
  return (
    <section className="p-5 bg-background/50 border">
      <PageTitle>Application configuration</PageTitle>
      <PageDescription>
        Configure your application settings from here.
      </PageDescription>
      <div className="mt-8 grid grid-cols-4 gap-4">
        <Suspense fallback={<PendingScreenshot />}>
          <Screenshot params={params} />
        </Suspense>
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
      <ApplicationDetails />
      <div className="col-span-4 mt-4">
        <Separator className="mb-4" />
        <h2 className="text-xl mb-2">Update application details</h2>
        <ApplicationConfiguration />
        <Separator className="my-4" />
        <div className="p-3 text-destructive">

          <h3 className="text-lg font-bold mb-4">Danger zone</h3>
          <ApplicationDelete />
        </div>
      </div>
    </HydrationBoundary>
  );
}

async function Screenshot({ params }: ApplicationPageProps) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["applications", "screenshot"],
    queryFn: () => getApplicationSreenshotUrl({ params }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ApplicationScreenshot />
    </HydrationBoundary>
  );
}

function PendingApplication() {
  return <Skeleton className="h-full w-full" />;
}

function PendingScreenshot() {
  return (
    <Skeleton className="w-1/2 h-full" />
  );
}
