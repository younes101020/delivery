import { Skeleton } from "@/components/ui/skeleton";
import { publicEnv } from "@/env";
import { getAllInstallations, getAllInstallationsWithRepos } from "@/lib/github";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Deployment } from "./_components/deployment";
import { GithubAppForm } from "./_components/github-app-form";
import { Login as LoginStep } from "./_components/login-form";
import { StepProvider } from "./_components/step";

async function GithubRepositoriesStep(props: { page: number }) {
  const githubInstallationsWithRepos = await getAllInstallationsWithRepos({ repoPage: props.page });
  if (!githubInstallationsWithRepos || githubInstallationsWithRepos.length <= 0)
    redirect("/?step=2");
  return (
    <Deployment
      githubInstallationsWithRepos={githubInstallationsWithRepos}
      currentPage={props.page}
    />
  );
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
