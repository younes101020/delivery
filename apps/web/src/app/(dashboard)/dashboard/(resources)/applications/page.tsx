import { PackagePlus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { buttonVariants } from "@/app/_components/ui/button";
import { EmptyState } from "@/app/_components/ui/empty-state";
import { PageTitle } from "@/app/_components/ui/page-title";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { formatDate } from "@/app/_lib/utils";

import { AppCard } from "./_components/app-card";
import { getApplications } from "./_lib/queries";

export default async function ApplicationsPage() {
  return (
    <section className="p-5 bg-background/50 border h-[90%]">
      <div className="flex justify-between gap-2">
        <PageTitle>My applications</PageTitle>
        <Link href="/dashboard/applications/new" className={buttonVariants({ variant: "outline" })}>
          <PackagePlus className="mr-1 mt-[.1rem]" />
          Deploy new application
        </Link>
      </div>

      <div className="mt-8 h-full">
        <Suspense fallback={<Skeleton className="h-32 w-full" />}>
          <ApplicationList />
        </Suspense>
      </div>
    </section>
  );
}

async function ApplicationList() {
  const applications = await getApplications();
  if (!applications || applications.length < 1)
    return <NoApplications />;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {applications.map(application => (
        <AppCard
          key={application.id}
          name={application.name}
          firstDeploymentAt={formatDate(application.createdAt) ?? "Unknown"}
        />
      ))}
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
