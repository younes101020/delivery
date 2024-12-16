import { Skeleton } from "@/components/ui/skeleton";
import { publicEnv } from "@/env";
import { getAllInstallations, getAllInstallationsWithRepos, Repository } from "@/lib/github";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Deployment } from "./_components/deployment";
import { GithubAppForm } from "./_components/github-app-form";
import { Login as LoginStep } from "./_components/login-form";
import { StepProvider } from "./_components/step";

interface StepChildrenProps {
  searchParams: Promise<{ step: number; page: number }> | undefined;
}

/**
 * This function iterates through all repository pages up to maxIteration to fetch GitHub installations with repos
 * This function fetches repositories page by page to handle pagination of GitHub API results
 */
async function getAllInstallReposForEachRepoPage(maxIteration: number) {
  const promises = Array.from({ length: maxIteration }, (_, i) =>
    getAllInstallationsWithRepos({ repoPage: i + 1 }),
  );
  const results = await Promise.all(promises);
  return results.flat().flatMap<Repository & { githubAppId: number }>(e => {
    if (!e?.githubAppId) {
      return [];
    }
    return e.repositories.map(repo => ({
      ...repo,
      githubAppId: e.githubAppId,
    }));
  });
}

async function GithubRepositoriesStep(props: StepChildrenProps) {
  const searchParams = await props.searchParams;
  if (!searchParams || searchParams.step != 3) {
    return null;
  }
  const repositories = await getAllInstallReposForEachRepoPage(searchParams.page ?? 1);
  if (!repositories || repositories.length <= 0) redirect("/?step=2");
  return <Deployment repositories={repositories} />;
}

async function GithubAppStep(props: StepChildrenProps) {
  const searchParams = await props.searchParams;
  if (!searchParams || searchParams.step != 2) {
    return null;
  }
  const allGithubInstallations = await getAllInstallations();
  if (allGithubInstallations && allGithubInstallations.length > 0) redirect("/?step=3");
  return <GithubAppForm baseUrl={publicEnv.NEXT_PUBLIC_BASEURL} />;
}

export default async function Onboarding(props: {
  searchParams?: Promise<{ step: number; page: number }>;
}) {
  const searchParams = props.searchParams?.then(sp => ({ step: sp.step, page: sp.page }));
  return (
    <div className="flex justify-center items-center h-[95vh]">
      <StepProvider>
        <LoginStep />
        <Suspense fallback={<Skeleton className="h-52 w-[50%]" />}>
          <GithubAppStep searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-52 w-full" />}>
          <GithubRepositoriesStep searchParams={searchParams} />
        </Suspense>
      </StepProvider>
    </div>
  );
}
