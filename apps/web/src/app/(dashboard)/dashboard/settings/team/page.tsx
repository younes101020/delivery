import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

import { PageDescription } from "@/app/_components/ui/page-description";
import { PageTitle } from "@/app/_components/ui/page-title";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { getQueryClient } from "@/app/_lib/get-rsc-query-client";
import { getTeamForUser } from "@/app/api/team/queries";

import { TeamFormContent, TeamList } from "./_components/team-form";

export const dynamic = "force-dynamic";

export default function TeamPage() {
  return (
    <section className="p-5 bg-background/50 border">
      <PageTitle>Team configurations</PageTitle>
      <PageDescription>Manage your team members.</PageDescription>

      <Suspense fallback={<PendingTeam />}>
        <Team />
      </Suspense>
      <TeamFormContent />
    </section>
  );
}

async function Team() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["team"],
    queryFn: () => getTeamForUser(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TeamList />
    </HydrationBoundary>
  );
}

function PendingTeam() {
  return <Skeleton className="w-full h-full" />;
}
