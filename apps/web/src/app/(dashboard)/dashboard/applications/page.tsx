import { PackagePlus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

import { AppCard } from "./_components/app-card";
import { getApplications } from "./_lib/queries";

function NoApplicationsScreen() {
  return (
    <div className="w-full h-full">
      <p className="text-center underline decoration-primary">No application</p>
    </div>
  );
}

async function ApplicationList() {
  const applications = await getApplications();
  if (!applications)
    return <NoApplicationsScreen />;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {applications.map(application => (
        <AppCard
          key={application.id}
          id={application.id}
          name={application.name}
          fqdn={application.fqdn}
          firstDeploymentAt={formatDate(application.createdAt) ?? "Unknown"}
        />
      ))}
    </div>
  );
}

export default async function ApplicationsPage() {
  return (
    <section className="p-5 bg-background/50 border">
      <div className="flex justify-between gap-2">
        <h1 className="text-3xl font-bold bg-primary text-primary-foreground px-2 py-1 w-fit">Applications list</h1>
        <Link href="/dashboard/applications/new" className={buttonVariants({ variant: "outline" })}>
          New application
          <PackagePlus className="ml-1 mt-[.1rem]" />
        </Link>
      </div>

      <div className="mt-8">
        <Suspense fallback={<Skeleton className="h-32 w-full" />}>
          <ApplicationList />
        </Suspense>
      </div>
    </section>
  );
}
