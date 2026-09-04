import { Suspense } from "react";

import { ApplicationSource } from "@/app/_components/deployment-applications-source";
import { PageDescription } from "@/app/_components/ui/page-description";
import { PageTitle } from "@/app/_components/ui/page-title";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { DeploymentSelectedApplicationProvider } from "@/app/_ctx/deployment-selected-application";

import FlowCanvasWrapper from "./_components/flow-canvas";
import { ForgeSideMenu } from "./_components/forge-side-menu";
import { fetchDockerHubImages } from "./_lib/docker-hub";

export const dynamic = "force-dynamic";

interface ForgePageProps {
  searchParams?: Promise<{
    page: string;
    githubapp?: string;
    step?: string;
    query?: string;
    category?: string;
  }>;
}

export default async function ForgePage({ searchParams }: ForgePageProps) {
  const resolvedSearchParams = await searchParams;
  const databaseImages = resolvedSearchParams?.category === "databases"
    ? await fetchDockerHubImages({ category: "databases", page: "1", pageSize: "25" })
    : undefined;
  const repositorySearchParams = searchParams ?? Promise.resolve({ page: "1" });

  return (
    <section className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden border bg-background/50 p-5">
      <div>
        <div>
          <PageTitle>Forge</PageTitle>
          <PageDescription>Visual stack builder, drag-and-drop canvas for designing your infrastructure</PageDescription>
        </div>
      </div>

      <div className="relative mt-4 min-h-0 flex-1">
        <FlowCanvasWrapper />
        <ForgeSideMenu
          category={resolvedSearchParams?.category}
          databaseImages={databaseImages}
          repositories={(
            <Suspense fallback={<PendingRepositories />}>
              <DeploymentSelectedApplicationProvider>
                <ApplicationSource defaultGithubAppsOpen={false} sp={repositorySearchParams} />
              </DeploymentSelectedApplicationProvider>
            </Suspense>
          )}
        />
      </div>
    </section>
  );
}

function PendingRepositories() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <Skeleton className="col-span-1 h-52" />
      <div className="col-span-3 space-y-4">
        <Skeleton className="h-10" />
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
      </div>
    </div>
  );
}
