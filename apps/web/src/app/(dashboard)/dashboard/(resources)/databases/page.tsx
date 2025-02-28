import { Boxes, PackagePlus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { buttonVariants } from "@/app/_components/ui/button";
import { EmptyState } from "@/app/_components/ui/empty-state";
import { PageTitle } from "@/app/_components/ui/page-title";
import { Skeleton } from "@/app/_components/ui/skeleton";

import { DatabaseCard } from "./_components/database-card";
import { SubscribeToSSE } from "./_components/subscribe-to-sse";
import { getDatabaseContainers } from "./_lib/queries";

export default function DatabasesPage() {
  return (
    <section className="p-5 bg-background/50 border">
      <div className="flex justify-between gap-2">
        <PageTitle>My databases</PageTitle>
        <Link href="/dashboard/applications/hub" className={buttonVariants({ variant: "outline" })}>
          <Boxes className="mr-1 mt-[.1rem] stroke-1" />
          Database Hub
        </Link>
      </div>

      <div className="h-full mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <SubscribeToSSE>
          <Suspense fallback={<Skeleton className="h-32 w-full" />}>
            <DatabaseList />
          </Suspense>
        </SubscribeToSSE>
      </div>
    </section>
  );
}

async function DatabaseList() {
  const dbContainers = await getDatabaseContainers();

  if (!dbContainers || dbContainers.length < 1) {
    return <NoDatabases />;
  }

  // Display running containers first
  const sortedContainers = [...dbContainers].sort((a, b) => {
    if (a.state === "running" && b.state !== "running")
      return -1;
    if (a.state !== "running" && b.state === "running")
      return 1;
    return 0;
  });

  return sortedContainers.map(dbContainer => (
    <DatabaseCard key={dbContainer.id} {...dbContainer} />
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
