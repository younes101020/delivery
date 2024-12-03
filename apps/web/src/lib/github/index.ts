import { client } from "@/lib/http";
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

export async function getAllInstallationsWithRepos(): Promise<Installation[] | null> {
  const response = await client.githubapps.$get();
  if (response.status !== 200) {
    return null;
  }
  const result = await response.json();

  const installations = await Promise.all(
    result.map(async (installation: any) => {
      const repos = await listInstallationRepositories({
        appId: installation.appId,
        privateKey: installation.privateKey,
        installationId: installation.installationId,
      });

      if (!repos.success) {
        return null;
      }

      return {
        githubAppId: installation.appId,
        githubInstallationName: installation.accountName,
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
