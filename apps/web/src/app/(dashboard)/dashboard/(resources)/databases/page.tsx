import { Boxes, PackagePlus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { buttonVariants } from "@/app/_components/ui/button";
import { EmptyState } from "@/app/_components/ui/empty-state";
import { PageDescription } from "@/app/_components/ui/page-description";
import { PageTitle } from "@/app/_components/ui/page-title";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { env } from "@/env";

import { DatabaseCard } from "./_components/database-card";
import { SubscribeToSSE } from "./_components/subscribe-to-sse";
import { getDatabaseService } from "./_lib/queries";

export default function DatabasesPage() {
  const baseUrl = env.BASE_URL;
  return (
    <section className="h-[90%] p-5 bg-background/50 border">
      <div className="flex justify-between gap-2">
        <div>
          <PageTitle>My databases</PageTitle>
          <PageDescription>A list of all your databases.</PageDescription>
        </div>

        <Link href="/dashboard/applications/hub" className={buttonVariants({ variant: "outline" })}>
          <Boxes className="mr-1 mt-[.1rem] stroke-1" />
          Database Hub
        </Link>
      </div>

      <div className="h-full mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <SubscribeToSSE baseUrl={baseUrl}>
          <Suspense fallback={<Skeleton className="h-32 w-full" />}>
            <DatabaseList />
          </Suspense>
        </SubscribeToSSE>
      </div>
    </section>
  );
}

async function DatabaseList() {
  const dbContainers = await getDatabaseService();

  if (!dbContainers || dbContainers.length < 1) {
    return <NoDatabases />;
  }

  return dbContainers.map(dbContainer => (
    <DatabaseCard key={dbContainer.name} {...dbContainer} />
  ));
}

function NoDatabases() {
  return (
    <div className="h-full flex justify-center items-center md:col-span-2 lg:col-span-3 xl:col-span-4">
      <EmptyState
        title="No databases"
        description="You can see all your databases here."
        icons={[PackagePlus]}
        action={{
          label: "Install database from Hub",
          href: "/databases/hub",
        }}
      />
    </div>
  );
}
