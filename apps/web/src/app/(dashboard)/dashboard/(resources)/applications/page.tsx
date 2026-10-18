import { getDictionary } from "@delivery/i18n/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { PackagePlus } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/app/_components/ui/button";
import { PageDescription } from "@/app/_components/ui/page-description";
import { PageTitle } from "@/app/_components/ui/page-title";
import { getQueryClient } from "@/app/_lib/get-rsc-query-client";
import { getCurrentLocale } from "@/app/_lib/locale";
import { env } from "@/env";

import { ApplicationList } from "./_components/application-list";
import { SubscribeToSSE } from "./_components/subscribe-to-sse";
import { getApplications } from "./_lib/queries";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const dictionary = await getDictionary(await getCurrentLocale());
  const { applications } = dictionary.resources;
  return (
    <section className="p-5 bg-background/50 border h-[90%]">
      <div className="flex justify-between gap-2">
        <div>
          <PageTitle>{applications.title}</PageTitle>
          <PageDescription>{applications.description}</PageDescription>
        </div>

        <Link href="/dashboard/applications/new" className={buttonVariants({ variant: "outline" })}>
          <PackagePlus className="mr-1 mt-[.1rem]" />
          {applications.deploy}
        </Link>
      </div>

      <div className="mt-8 h-full">
        <Applications />
      </div>
    </section>
  );
}

function Applications() {
  const baseUrl = env.WEB_BASE_URL;

  const queryClient = getQueryClient();

  queryClient.prefetchQuery({
    queryKey: ["applications"],
    queryFn: () => getApplications(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SubscribeToSSE baseUrl={baseUrl}>
        <ApplicationList />
      </SubscribeToSSE>
    </HydrationBoundary>
  );
}
