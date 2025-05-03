import { PackagePlus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { buttonVariants } from "@/app/_components/ui/button";
import { EmptyState } from "@/app/_components/ui/empty-state";
import { PageDescription } from "@/app/_components/ui/page-description";
import { PageTitle } from "@/app/_components/ui/page-title";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { formatDate } from "@/app/_lib/utils";
import { getActiveDatabaseServices } from "@/app/(dashboard)/dashboard/(resources)/databases/_lib/queries";
import { env } from "@/env";

import { AppCard } from "./_components/app-card";
import { NewAppCard } from "./_components/new-app-card";
import { SubscribeToSSE } from "./_components/subscribe-to-sse";
import { getApplications } from "./_lib/queries";

export default async function ApplicationsPage() {
  const baseUrl = env.BASE_URL;
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
        <SubscribeToSSE baseUrl={baseUrl}>
          <Suspense fallback={<Skeleton className="h-32 w-full" />}>
            <ApplicationList />
          </Suspense>
        </SubscribeToSSE>
      </div>
    </section>
  );
}

async function ApplicationList() {
  const [applications, dbServices] = await Promise.all([getApplications(), getActiveDatabaseServices()]);
  if (!applications || applications.length < 1)
    return <NoApplications />;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {applications.map(application => (
        <AppCard
          key={application.id}
          id={application.id}
          name={application.name}
          initialState={application.isActive ? "running" : "stop"}
          firstDeploymentAt={formatDate(application.createdAt) ?? "Unknown"}
          databases={dbServices}
        />
      ))}
      <NewAppCard />
    </div>
  );
}

function NoApplications() {
  return (
    <div className="h-full flex justify-center items-center">
      <EmptyState
        title="No application"
        description="You can see all your applications here."
        icons={[PackagePlus]}
        action={{
          label: "Deploy application",
          href: "/applications/new",
        }}
      />
    </div>

  );
}
