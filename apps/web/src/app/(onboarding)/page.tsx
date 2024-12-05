import { Skeleton } from "@/components/ui/skeleton";
import env from "@/env";
import { getAllInstallations, getAllInstallationsWithRepos } from "@/lib/github";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Deployment } from "./_components/deployment";
import { GithubAppForm } from "./_components/github-app-form";
import { Login as LoginStep } from "./_components/login-form";
import { StepProvider } from "./_components/step";

async function GithubRepositoriesStep() {
  const githubInstallationsWithRepos = await getAllInstallationsWithRepos();
  console.log(githubInstallationsWithRepos, "jkfkf")
  if (!githubInstallationsWithRepos || githubInstallationsWithRepos.length <= 0)
    redirect("/?step=2");
  return <Deployment githubInstallationsWithRepos={githubInstallationsWithRepos} />;
}

async function GithubAppStep() {
  const allGithubInstallations = await getAllInstallations();
  if (allGithubInstallations && allGithubInstallations.length > 0) redirect("/?step=3");
  return <GithubAppForm baseUrl={env.NEXT_PUBLIC_BASEURL} />;
}

export default function Onboarding() {
  return (
    <div className="flex justify-center items-center h-[95vh]">
      <StepProvider>
        <LoginStep />
        <GithubAppStep />
        <Suspense fallback={<Skeleton className="h-52 w-full" />}>
          <GithubRepositoriesStep />
        </Suspense>
      </StepProvider>
    </div>
  );
}
