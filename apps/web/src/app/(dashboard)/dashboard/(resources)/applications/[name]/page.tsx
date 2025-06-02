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
  searchParams: Promise<{ name: string }>;
}

export default function ApplicationPage({ searchParams }: ApplicationPageProps) {
  return (
    <section className="p-5 bg-background/50 border">
      <PageTitle>Application configuration</PageTitle>
      <PageDescription>
        Configure your application settings from here.
      </PageDescription>
      <div className="mt-8 grid grid-cols-4 gap-4">
        <Suspense fallback={<PendingApplication />}>
          <Application searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  );
}

async function Application({ searchParams }: ApplicationPageProps) {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["applications", "details"],
      queryFn: () => getApplicationByName(searchParams),
    }),
    queryClient.prefetchQuery({
      queryKey: ["applications", "screenshot"],
      queryFn: () => getApplicationSreenshotUrl({ searchParams }),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ApplicationScreenshot />
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

function PendingApplication() {
  return <Skeleton className="h-full w-full" />;
}
