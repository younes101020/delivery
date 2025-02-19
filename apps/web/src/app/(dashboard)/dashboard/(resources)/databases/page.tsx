import { Boxes } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/app/_components/ui/button";
import { PageTitle } from "@/app/_components/ui/page-title";

import { DatabaseCard } from "./_components/database-card";

export default function DatabasesPage() {
  return (
    <section className="h-[90%] p-5 bg-background/50 border">
      <div className="flex justify-between gap-2">
        <PageTitle>My databases</PageTitle>
        <Link href="/dashboard/applications/hub" className={buttonVariants({ variant: "outline" })}>
          <Boxes className="mr-1 mt-[.1rem] stroke-1" />
          Database Hub
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <DatabaseCard className="p-4" title="PostgresSQL" withArrow />
      </div>
    </section>
  );
}

/* function NoDatabases() {
  return (
    <div className="h-full flex justify-center items-center">
      <EmptyState
        title="No databases"
        description="You can see all your databases here."
        icons={[PackagePlus]}
        action={{
          label: "Select new database from Hub",
          href: "/databases/hub",
        }}
      />
    </div>
  );
} */
