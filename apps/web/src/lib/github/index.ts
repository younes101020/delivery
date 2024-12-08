import { client } from "@/lib/http";
import { GithubInstallation } from "@delivery/jobs/types";
import { listInstallationRepositories } from "./utils";

export type Repository = {
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
  const response = await client.githubapps.$get();
  if (response.status !== 200) {
    return null;
  }
  const result = await response.json();
  return result;
}

export async function getAllInstallationsWithRepos(): Promise<Installation[] | null> {
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
      });

      if (!repos.success) {
        return null;
      }

      return {
        githubAppId: installation.appId,
        //githubInstallationName: installation.accountName,
        repositories: repos.repositories.map(repo => ({
          full_name: repo.full_name,
          git_url: repo.git_url,
          description: repo.description,
        })),
      };
    }),
  );

  return installations.filter(Boolean) as Installation[];
}
