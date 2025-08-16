import { PageDescription } from "@/app/_components/ui/page-description";
import { PageTitle } from "@/app/_components/ui/page-title";
import { database } from "@/app/(dashboard)/dashboard/(resources)/databases/const";

import { DatabaseCreateDialog } from "./_components/create-database-dialog";
import { DatabaseCard } from "./_components/database-card";

export const dynamic = "force-dynamic";

export default function DatabasesPage() {
  return (
    <section className="h-[90%] p-5 bg-background/50 border">
      <PageTitle>Databases Hub</PageTitle>
      <PageDescription>A list of available databases you can use for your applications.</PageDescription>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {database.map(detail => (
          <DatabaseCard
            key={detail.value}
            {...detail}
            fillIcon={detail.utilityClass.fillIcon}
          >
            <DatabaseCreateDialog triggerText="Create" type={detail.value} />
          </DatabaseCard>
        ),
        )}
      </div>
    </section>
  );
}
