import { Skeleton } from "@/components/ui/skeleton";
import { publicEnv } from "@/env";
import { getAllInstallations, getAllInstallReposForEachRepoPage } from "@/lib/github";
import { getServerConfiguration } from "@/lib/server";
import { getUser } from "@/lib/users";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Login } from "../../_components/login-form";
import { Deployment } from "./_components/deployment";
import { DomainNameForm } from "./_components/domain-name-form";
import { GithubAppForm } from "./_components/github-app-form";
import { StepProvider } from "./_components/step";

interface StepChildrenProps {
  searchParams: Promise<{ step: number; page: number }> | undefined;
}

async function GithubRepositoriesStep(props: StepChildrenProps) {
  const searchParams = await props.searchParams;
  if (!searchParams || searchParams.step != 4) {
    return null;
  }
  const repositories = await getAllInstallReposForEachRepoPage(searchParams.page ?? 1);
  if (!repositories || repositories.length <= 0) redirect("/onboarding/?step=3");
  return <Deployment repositories={repositories} />;
}

async function GithubAppStep(props: StepChildrenProps) {
  const searchParams = await props.searchParams;
  if (!searchParams || searchParams.step != 3) {
    return null;
  }
  const allGithubInstallations = await getAllInstallations();
  if (allGithubInstallations && allGithubInstallations.length > 0) redirect("/onboarding/?step=4");
  return <GithubAppForm baseUrl={publicEnv.NEXT_PUBLIC_BASEURL} />;
}

async function DomainNameStep(props: StepChildrenProps) {
  const searchParams = await props.searchParams;
  if (!searchParams || searchParams.step != 2) {
    return null;
  }
  const serverConfig = await getServerConfiguration();
  if (serverConfig?.domainName) redirect("/onboarding/?step=3");
  return <DomainNameForm />;
}

async function LoginStep(props: StepChildrenProps) {
  const searchParams = await props.searchParams;
  if (searchParams && searchParams.step) {
    return null;
  }
  const user = await getUser();
  if (user) {
    redirect("/onboarding/?step=2");
  }
  return <Login />;
}

function CheckStepStatusLoadingScreen() {
  return (
    <Skeleton className="flex justify-center items-center h-52 w-full">
      Check step status <span className=" text-primary">...</span>
    </Skeleton>
  );
}

export default async function OnboardingPage(props: {
  searchParams?: Promise<{ step: number; page: number }>;
}) {
  const searchParams = props.searchParams?.then((sp) => ({ step: sp.step, page: sp.page }));
  return (
    <div className="flex justify-center items-center h-full *:lg:w-[70%] *:w-[90%]">
      <StepProvider>
        <Suspense fallback={<CheckStepStatusLoadingScreen />}>
          <LoginStep searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<CheckStepStatusLoadingScreen />}>
          <DomainNameStep searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<CheckStepStatusLoadingScreen />}>
          <GithubAppStep searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<CheckStepStatusLoadingScreen />}>
          <GithubRepositoriesStep searchParams={searchParams} />
        </Suspense>
      </StepProvider>
    </div>
  );
}
