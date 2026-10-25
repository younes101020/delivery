import { getDictionary } from "@delivery/i18n/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { enableHTTPMocks } from "@/../__mocks__/utils";
import { AppSidebar } from "@/app/_components/app-sidebar";
import { SubscribeToSSE } from "@/app/_components/subscribe-to-sse";
import { Breadcrumb, BreadcrumbList } from "@/app/_components/ui/breadcrumb";
import { Separator } from "@/app/_components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/app/_components/ui/sidebar";
import { ResourcesDictionaryProvider } from "@/app/_ctx/resources-dictionary";
import { getQueryClient } from "@/app/_lib/get-rsc-query-client";
import { getDeliveryVersionInfo } from "@/app/_lib/jobs/queries";
import { getCurrentLocale } from "@/app/_lib/locale";
import { env } from "@/env";

import { DynamicBreadcrumb } from "./_components/breadcrumb";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getCurrentLocale();
  const dictionary = await getDictionary(locale);
  enableHTTPMocks();
  const queryClient = getQueryClient();
  const baseUrl = env.WEB_BASE_URL;

  queryClient.prefetchQuery({
    queryKey: ["version"],
    queryFn: () => getDeliveryVersionInfo(),
  });

  return (
    <ResourcesDictionaryProvider deployments={dictionary.deployments} locale={locale} navigation={dictionary.navigation} resources={dictionary.resources} settings={dictionary.settings}>
      <SubscribeToSSE baseUrl={baseUrl}>
        <SidebarProvider>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <AppSidebar />
          </HydrationBoundary>
          <SidebarInset>
            <div className="flex h-16 shrink-0 items-center gap-2">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger aria-label={dictionary.navigation.toggle} className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <DynamicBreadcrumb />
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>
            <div className="h-full px-4">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </SubscribeToSSE>
    </ResourcesDictionaryProvider>
  );
}
