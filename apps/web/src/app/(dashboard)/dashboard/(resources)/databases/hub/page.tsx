"use cache";

import { PageTitle } from "@/app/_components/ui/page-title";

import { DatabaseCreateDialog } from "./_components/create-database-dialog";
import { DatabaseCard } from "./_components/database-card";

export default async function DatabasesPage() {
  return (
    <section className="h-[90%] p-5 bg-background/50 border">
      <div className="flex justify-between gap-2">
        <PageTitle>Databases Hub</PageTitle>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <DatabaseCard title="PostgresSQL">
          <DatabaseCreateDialog triggerText="Create" type="postgres" />
        </DatabaseCard>
      </div>
    </section>
  );
}
