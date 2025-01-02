import { client } from "@/lib/http";
import { GithubInstallation } from "@delivery/jobs/types";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { listInstallationRepositories } from "./utils";

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

/**
 * This function iterates through all repository pages up to maxIteration to fetch GitHub installations with repos
 * This function fetches repositories page by page to handle pagination of GitHub API results
 */
export async function getAllInstallReposForEachRepoPage(maxIteration: number) {
  const promises = Array.from({ length: maxIteration }, (_, i) =>
    getAllInstallationsWithRepos({ repoPage: i + 1 }),
  );
  const results = await Promise.all(promises);
  return results.flat().flatMap<Repository & { githubAppId: number }>((e) => {
    if (!e?.githubAppId) {
      return [];
    }
    return e.repositories.map((repo) => ({
      ...repo,
      githubAppId: e.githubAppId,
    }));
  });
}

export async function getAllInstallations(): Promise<
  (GithubInstallation & { privateKey: string })[] | null
> {
  "use cache";
  cacheTag("github-app-installations-creds");
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
        repositories: repos.repositories.map((repo) => ({
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
