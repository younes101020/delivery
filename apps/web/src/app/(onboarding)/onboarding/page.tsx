import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Deployment } from "@/app/_components/deployment";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { getAllGithubAppCreds } from "@/app/_lib/github/queries";
import { getUser } from "@/app/_lib/user-session";

import { Login } from "../../_components/login-form";
import { DomainNameForm } from "./_components/domain-name-form";
import { GithubAppForm } from "./_components/github-app-form";
import { StepProvider } from "./_components/step";
import { getServerConfiguration } from "./_lib/queries";

interface SearchParams {
  searchParams?: Promise<{ step: string; page: string }>;
}

export default async function OnboardingPage({ searchParams }: SearchParams) {
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
          <Deployment sp={searchParams} onboarding={true} />
        </Suspense>
      </StepProvider>
    </div>
  );
}

async function GithubAppStep(props: SearchParams) {
  const searchParams = await props.searchParams;
  const onboardingStep = searchParams ? Number.parseInt(searchParams.step) : null;
  if (onboardingStep !== 3) {
    return null;
  }
  const allGithubInstallations = await getAllGithubAppCreds();
  if (allGithubInstallations && allGithubInstallations.length > 0)
    redirect("/onboarding/?step=4");
  return <GithubAppForm />;
}

async function DomainNameStep(props: SearchParams) {
  const searchParams = await props.searchParams;
  const onboardingStep = searchParams ? Number.parseInt(searchParams.step) : null;
  if (onboardingStep !== 2) {
    return null;
  }

  const serverConfig = await getServerConfiguration();
  if (serverConfig?.domainName)
    redirect("/onboarding/?step=3");
  return <DomainNameForm />;
}

async function LoginStep(props: SearchParams) {
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
      Check step status
      {" "}
      <span className=" text-primary">...</span>
    </Skeleton>
  );
}
