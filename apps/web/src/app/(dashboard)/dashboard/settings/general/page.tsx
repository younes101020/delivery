import { getDictionary } from "@delivery/i18n/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

import { PageDescription } from "@/app/_components/ui/page-description";
import { PageTitle } from "@/app/_components/ui/page-title";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { getQueryClient } from "@/app/_lib/get-rsc-query-client";
import { getCurrentLocale } from "@/app/_lib/locale";

import { DeliveryInstanceForm } from "./_components/delivery-instance-form";
import { getDeliveryWebInstanceConfiguration } from "./_lib/queries";

export const dynamic = "force-dynamic";

export default async function GeneralPage() {
  const { settings } = await getDictionary(await getCurrentLocale());
  return (
    <section className="p-5 bg-background/50 border">
      <PageTitle>{settings.general.title}</PageTitle>
      <PageDescription>{settings.general.description}</PageDescription>

      <div className="mt-8 flex flex-col gap-8">
        <Suspense fallback={<PendingInstanceConfiguration />}>
          <InstanceConfiguration />
        </Suspense>
      </div>
    </section>
  );
}

async function InstanceConfiguration() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["delivery-instance-configuration"],
    queryFn: getDeliveryWebInstanceConfiguration,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DeliveryInstanceForm />
    </HydrationBoundary>
  );
}

function PendingInstanceConfiguration() {
  return <Skeleton className="h-full w-full" />;
}
