import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

import { PageDescription } from "@/app/_components/ui/page-description";
import { PageTitle } from "@/app/_components/ui/page-title";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { getQueryClient } from "@/app/_lib/get-rsc-query-client";

import { ApplicationDomainConfigurationForm } from "./_components/app-domain-name-form";
import { DNSRecords } from "./_components/dns-records-table";
import { getApplicationsDomainConfiguration } from "./_lib/queries";

export default function DomainNamePage() {
  return (
    <section className="p-5 bg-background/50 border h-[90%]">

      <PageTitle>My applications domain name</PageTitle>
      <PageDescription>A list of all your applications domain name.</PageDescription>

      <div className="mt-8 h-full flex flex-col">
        <h5 className="text-2xl tracking-tight h-fit">Wildcard</h5>
        <h4 className="text-muted-foreground text-sm mb-2">Follow these steps to enable auto-generated wildcard domains for your applications.</h4>
        <div className="w-full grid grid-cols-3 gap-4">
          <Suspense fallback={<PendingInstanceConfiguration />}>
            <ApplicationsDomainConfiguration />
          </Suspense>
        </div>

      </div>
    </section>
  );
}

async function ApplicationsDomainConfiguration() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["application-domain-configuration"],
    queryFn: getApplicationsDomainConfiguration,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ApplicationDomainConfigurationForm />
      <DNSRecords />
    </HydrationBoundary>
  );
}

function PendingInstanceConfiguration() {
  return <Skeleton className="h-full w-full" />;
}
