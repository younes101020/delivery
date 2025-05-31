import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { PackagePlus } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/app/_components/ui/button";
import { PageDescription } from "@/app/_components/ui/page-description";
import { PageTitle } from "@/app/_components/ui/page-title";
import { getQueryClient } from "@/app/_lib/get-query-client";
import { env } from "@/env";

import { getActiveDatabaseServices } from "../databases/_lib/queries";
import { ApplicationList } from "./_components/application-list";
import { SubscribeToSSE } from "./_components/subscribe-to-sse";
import { getApplications } from "./_lib/queries";

export default function ApplicationsPage() {
  const baseUrl = env.BASE_URL;

  const queryClient = getQueryClient();

  queryClient.prefetchQuery({
    queryKey: ["applications"],
    queryFn: () => Promise.all([
      getApplications(),
      getActiveDatabaseServices(),
    ]),
  });

  return (
    <section className="p-5 bg-background/50 border h-[90%]">
      <div className="flex justify-between gap-2">
        <div>
          <PageTitle>My applications</PageTitle>
          <PageDescription>A list of all your applications.</PageDescription>
        </div>

        <Link href="/dashboard/applications/new" className={buttonVariants({ variant: "outline" })}>
          <PackagePlus className="mr-1 mt-[.1rem]" />
          Deploy
        </Link>
      </div>

      <div className="mt-8 h-full">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <SubscribeToSSE baseUrl={baseUrl}>
            <ApplicationList />
          </SubscribeToSSE>
        </HydrationBoundary>

      </div>
    </section>
  );
}
