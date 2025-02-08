import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumb, BreadcrumbList } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { DynamicBreadcrumb } from "./_components/breadcrumb";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
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
  );
}
