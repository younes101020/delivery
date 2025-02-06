import { redirect } from "next/navigation";

import { getGithubRepositoriesByGithubAppId } from "@/app/_lib/github/repositories";

import { DeploymentForm } from "./deployment-form";

interface DeploymentProps {
  sp: Promise<{ page: string; githubapp?: string; step?: string }> | undefined;
  onboarding?: boolean;
}

export async function Deployment({ sp, onboarding = false }: DeploymentProps) {
  const searchParams = await sp;

  if (onboarding) {
    const onboardingStep = searchParams && searchParams.step ? Number.parseInt(searchParams.step) : null;
    if (onboardingStep !== 4) {
      return null;
    }
  }

  const repositoryPage = searchParams?.page ? Number.parseInt(searchParams.page) : 1;
  const githubAppId = searchParams?.githubapp ? Number.parseInt(searchParams.githubapp) : undefined;

  const installationWithRepos = await getGithubRepositoriesByGithubAppId(repositoryPage, githubAppId);

  if (!installationWithRepos) {
    if (onboarding)
      redirect("/onboarding/?step=3");

    return <p className="mt-5">No Github repository found</p>;
  }

  const { repositories, githubApps } = installationWithRepos;

  return <DeploymentForm repositories={repositories} githubApps={githubApps} isOnboarding={onboarding} />;
}
