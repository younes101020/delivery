import { redirect } from "next/navigation";

import { getGithubRepositories } from "@/app/_lib/github/repositories";

import { DeploymentForm } from "./deployment-form";

interface DeploymentProps {
  paginationPromise: Promise<{ page: number; step?: number }> | undefined;
  onboarding?: boolean;
}

export async function Deployment({ paginationPromise, onboarding = false }: DeploymentProps) {
  const searchParams = await paginationPromise;

  if (onboarding) {
    if (!searchParams || searchParams.step !== 4) {
      return null;
    }
  }

  const page = searchParams && searchParams.page;
  const installations = await getGithubRepositories(page ?? 1);

  if (!installations) {
    if (onboarding)
      redirect("/onboarding/?step=3");

    return <p className="mt-5">No Github repository found</p>;
  }

  return <DeploymentForm installations={installations} isOnboarding={onboarding} />;
}
