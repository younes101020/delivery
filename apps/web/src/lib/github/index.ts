import { client } from "@/lib/http";
import { GithubInstallation } from "@delivery/jobs/types";
import { listInstallationRepositories } from "./utils";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export type Repository = {
  id: number;
  full_name: string;
  git_url: string;
  description: string | null;
};

export type Installation = {
  githubAppId: number;
  githubInstallationName: string;
  repositories: Repository[];
};

export async function getAllInstallations(): Promise<
  (GithubInstallation & { privateKey: string })[] | null
> {
  "use cache";
  cacheTag('github-app-installations-creds')
  console.log('okkkk')
  const response = await client.githubapps.$get();
  if (response.status !== 200) {
    return null;
  }
  const result = await response.json();
  return result;
}

export async function getAllInstallationsWithRepos({
  repoPage,
}: {
  repoPage: number;
}): Promise<Installation[] | null> {
  const result = await getAllInstallations();
  if (!result) {
    return null;
  }

  const installations = await Promise.all(
    result.map(async (installation: GithubInstallation & { privateKey: string }) => {
      const repos = await listInstallationRepositories({
        appId: installation.appId.toString(),
        privateKey: installation.privateKey,
        installationId: installation.installationId.toString(),
        repoPage,
      });

      if (!repos.success) {
        return null;
      }

      return {
        githubAppId: installation.appId,
        repositories: repos.repositories.map(repo => ({
          id: repo.id,
          full_name: repo.full_name,
          git_url: repo.git_url,
          description: repo.description,
        })),
      };
    }),
  );

  return installations.filter(Boolean) as Installation[];
}
