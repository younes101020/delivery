import type { GithubInstallation } from "@delivery/jobs/types";

import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { client } from "@/lib/http";

import type { FailedInstallation, Installation } from "./types";

import { listInstallationRepositories } from "./utils";

/**
 * Fetches GitHub repositories for all installations, handling pagination.
 */
export async function getAllInstallReposForEachRepoPage(iteration: number) {
  const installations = await getAllInstallationsWithRepos({ repoPage: iteration });
  if (!installations)
    return null;
  const nonNullInstallations = installations
    .filter(
      (installation): installation is NonNullable<typeof installation> => installation !== null,
    )
    .flat();
  return nonNullInstallations.length <= 0 ? null : nonNullInstallations;
}

export async function getAllInstallations(): Promise<
  (GithubInstallation & { privateKey: string | null })[] | null
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

function isSuccessful(
  installation: Installation | FailedInstallation,
): installation is Installation {
  return !("failed" in installation);
}

export async function getAllInstallationsWithRepos({ repoPage }: { repoPage: number }) {
  const result = await getAllInstallations();
  if (!result) {
    return null;
  }

  const installations = await Promise.all(
    result.map(async (installation: GithubInstallation & { privateKey: string | null }) => {
      const repositoriesResponse = await listInstallationRepositories({
        appId: installation.appId.toString(),
        privateKey: installation.privateKey,
        installationId: installation.installationId.toString(),
        repoPage,
      });

      if (!repositoriesResponse.success) {
        return { failed: true } as FailedInstallation;
      }

      const { repositories, hasMore } = repositoriesResponse;

      return {
        githubAppId: installation.appId,
        repositories: repositories.map(repo => ({
          id: repo.id,
          full_name: repo.full_name,
          git_url: repo.git_url,
          description: repo.description,
        })),
        hasMore,
      } as Installation;
    }),
  );

  return installations.filter(isSuccessful);
}
