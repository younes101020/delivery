import { Skeleton } from "@/components/ui/skeleton";
import { publicEnv } from "@/env";
import { getAllInstallations, getAllInstallationsWithRepos } from "@/lib/github";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Deployment } from "./_components/deployment";
import { GithubAppForm } from "./_components/github-app-form";
import { Login as LoginStep } from "./_components/login-form";
import { StepProvider } from "./_components/step";

/**
 * Iterates through all repository pages up to maxIteration to fetch GitHub installations with repos
 * This function fetches repositories page by page to handle pagination of GitHub API results
 */
async function getAllInstallReposForEachRepoPage(maxIteration: number) {
  const promises = Array.from({ length: maxIteration }, (_, i) =>
    getAllInstallationsWithRepos({ repoPage: i + 1 }),
  );
  const results = await Promise.all(promises);
  return results.flat().flatMap(e => e!.repositories);
}

async function GithubRepositoriesStep(props: { page: number }) {
  const repositories = await getAllInstallReposForEachRepoPage(props.page);
  if (!repositories || repositories.length <= 0) redirect("/?step=2");
  return <Deployment repositories={repositories} />;
}

async function GithubAppStep() {
  const allGithubInstallations = await getAllInstallations();
  if (allGithubInstallations && allGithubInstallations.length > 0) redirect("/?step=3");
  return <GithubAppForm baseUrl={publicEnv.NEXT_PUBLIC_BASEURL} />;
}

export default async function Onboarding(props: {
  searchParams?: Promise<{ step: string; page: number }>;
}) {
  const searchParams = await props.searchParams;
  if (!searchParams) {
    return notFound();
  }
  return (
    <div className="flex justify-center items-center h-[95vh]">
      <StepProvider>
        <LoginStep />
        {searchParams.step === "2" && <GithubAppStep />}
        {searchParams.step === "3" && (
          <Suspense fallback={<Skeleton className="h-52 w-full" />}>
            <GithubRepositoriesStep page={searchParams.page ?? "1"} />
          </Suspense>
        )}
      </StepProvider>
    </div>
  );
}
