import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { PageDescription } from "@/app/_components/ui/page-description";
import { PageTitle } from "@/app/_components/ui/page-title";
import { getQueryClient } from "@/app/_lib/get-query-client";

import { DeliveryInstanceForm } from "./_components/delivery-instance-form";
import { getDeliveryWebInstanceConfiguration } from "./_lib/queries";

export default function GeneralPage() {
  const queryClient = getQueryClient();

  queryClient.prefetchQuery({
    queryKey: ["delivery-instance-configuration"],
    queryFn: getDeliveryWebInstanceConfiguration,
  });

  return (
    <section className="p-5 bg-background/50 border">
      <PageTitle>General configurations</PageTitle>
      <PageDescription>Manage configurations related to your delivery instance.</PageDescription>

      <div className="mt-8 flex flex-col gap-8">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <DeliveryInstanceForm />
        </HydrationBoundary>
      </div>
    </section>
  );
}
