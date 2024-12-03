import { Skeleton } from "@/components/ui/skeleton";
import env from "@/env";
import { getAllInstallationsWithRepos } from "@/lib/github";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Deployment } from "./_components/deployment";
import { GithubAppForm } from "./_components/github-app-form";
import { Login } from "./_components/login-form";
import { StepProvider } from "./_components/step";

async function GithubRepositories() {
  const githubInstallationsWithRepos = await getAllInstallationsWithRepos();
  if (!githubInstallationsWithRepos) redirect("/?step=2");
  return <Deployment githubInstallationsWithRepos={githubInstallationsWithRepos} />;
}

export default function Onboarding() {
  return (
    <div className="flex justify-center items-center h-[95vh]">
      <StepProvider>
        <Login />
        <GithubAppForm baseUrl={env.NEXT_PUBLIC_BASEURL} />
        <Suspense fallback={<Skeleton className="h-52 w-full" />}>
          <GithubRepositories />
        </Suspense>
      </StepProvider>
    </div>
  );
}
