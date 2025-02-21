import { Boxes, PackagePlus } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/app/_components/ui/button";
import { EmptyState } from "@/app/_components/ui/empty-state";
import { PageTitle } from "@/app/_components/ui/page-title";

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

      <div className="h-full mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <NoDatabases />
      </div>
    </section>
  );
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
