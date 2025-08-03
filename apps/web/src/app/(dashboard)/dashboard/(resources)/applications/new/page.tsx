import { Suspense } from "react";

import { Deployment } from "@/app/_components/deployment";
import { PageDescription } from "@/app/_components/ui/page-description";
import { PageTitle } from "@/app/_components/ui/page-title";
import { Skeleton } from "@/app/_components/ui/skeleton";

export const dynamic = "force-dynamic";

export default function NewApplicationPage(props: {
  searchParams?: Promise<{ page: string }>;
}) {
  return (
    <section className="p-5 bg-background/50 border">
      <PageTitle>New application</PageTitle>
      <PageDescription>Start deploying your new application from here.</PageDescription>
      <Suspense fallback={<PendingDeployment />}>
        <Deployment sp={props.searchParams!} />
      </Suspense>
    </section>
  );
}

function PendingDeployment() {
  return (
    <div className="mt-6">
      <Skeleton className="h-10 w-1/2 mb-4" />
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}
