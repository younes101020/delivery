import type { Dictionary, Locale } from "@delivery/i18n";

import { getDictionary } from "@delivery/i18n/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Deployment } from "@/app/_components/deployment";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { getAllGithubAppCreds } from "@/app/_lib/github/queries";
import { getCurrentLocale } from "@/app/_lib/locale";
import { getUser } from "@/app/_lib/user-session";

import { Login } from "../../_components/login-form";
import { DomainNameForm } from "./_components/domain-name-form";
import { GithubAppForm } from "./_components/github-app-form";
import { OnboardingDictionaryProvider } from "./_components/onboarding-dictionary";
import { SkipOnboardingForm } from "./_components/skip-onboarding";
import { StepProvider } from "./_components/step";
import { getServerConfiguration } from "./_lib/queries";

interface SearchParams {
  searchParams?: Promise<{ step: string; page: string }>;
}

export default async function OnboardingPage({ searchParams }: SearchParams) {
  const locale = await getCurrentLocale();
  const dictionary = await getDictionary(locale);

  return (
    <OnboardingDictionaryProvider locale={locale} onboarding={dictionary.onboarding}>
      <div className="flex justify-center items-center h-full max-w-7xl mx-auto relative">
        <Suspense fallback={<PendingSkipStepper />}>
          <SkipDeploymentForm searchParams={searchParams} />
        </Suspense>

        <StepProvider>
          <Suspense fallback={<CheckStepStatusLoadingScreen message={dictionary.onboarding.stepStatusLoading} />}>
            <LoginStep auth={dictionary.auth} locale={locale} searchParams={searchParams} />
          </Suspense>
          <Suspense fallback={<CheckStepStatusLoadingScreen message={dictionary.onboarding.stepStatusLoading} />}>
            <DomainNameStep searchParams={searchParams} />
          </Suspense>
          <Suspense fallback={<CheckStepStatusLoadingScreen message={dictionary.onboarding.stepStatusLoading} />}>
            <GithubAppStep searchParams={searchParams} />
          </Suspense>
          <Suspense fallback={<CheckStepStatusLoadingScreen message={dictionary.onboarding.stepStatusLoading} />}>
            <Deployment sp={searchParams!} onboarding={true} />
          </Suspense>
        </StepProvider>
      </div>
    </OnboardingDictionaryProvider>
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
  return <GithubAppForm isOnboarding={true} />;
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

interface LoginStepProps extends SearchParams {
  auth: Dictionary["auth"];
  locale: Locale;
}

async function LoginStep({ auth, locale, searchParams }: LoginStepProps) {
  const resolvedSearchParams = await searchParams;
  if (resolvedSearchParams && resolvedSearchParams.step) {
    return null;
  }
  const user = await getUser();
  if (user) {
    redirect("/onboarding/?step=2");
  }
  return <Login auth={auth} isOnboarding={true} locale={locale} />;
}

async function SkipDeploymentForm(props: SearchParams) {
  const searchParams = await props.searchParams;
  const onboardingStep = searchParams ? (Number.parseInt(searchParams.step) || 0) : null;

  if (!onboardingStep)
    return null;

  // At least, complete first step (login) to skip deployment
  if (onboardingStep < 2)
    return null;

  return (
    <div className="absolute top-4 right-0 shadow-lg">
      <SkipOnboardingForm />
    </div>
  );
}

function PendingSkipStepper() {
  return (
    <Skeleton className="h-28 w-44" />
  );
}

function CheckStepStatusLoadingScreen({ message }: { message: string }) {
  return (
    <Skeleton className="flex justify-center items-center h-52 w-full">
      {message}
    </Skeleton>
  );
}
