import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";

import type { FailedInstallation, Installation, ListInstallationRepositoriesResult } from "./types";

import { getAllGithubAppInstallations } from "./queries";

export async function getGithubRepositories(iteration: number) {
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

export async function getAllInstallationsWithRepos({ repoPage }: { repoPage: number }) {
  const result = await getAllGithubAppInstallations();
  if (!result) {
    return null;
  }

  const installations = await Promise.all(
    result.map(async (installation) => {
      const repositoriesResponse = await listGithubRepositories({
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
      };
    }),
  );

  return installations.filter(isSuccessful);
}

export async function listGithubRepositories({
  appId,
  privateKey,
  installationId,
  repoPerPage = 5,
  repoPage = 1,
  type = "all",
}: {
  appId: string;
  privateKey: string | null;
  installationId: string;
  type?: string;
  repoPerPage?: number;
  repoPage?: number;
}): Promise<ListInstallationRepositoriesResult> {
  "use cache";
  try {
    const octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId,
        privateKey,
        installationId,
      },
    });

    const { token } = (await octokit.auth({
      type: "installation",
    })) as { token: string };

    const installationOctokit = new Octokit({
      auth: token,
    });

    const reposPromises = Array.from({ length: repoPage }, (_, pageIndex) =>
      installationOctokit.apps.listReposAccessibleToInstallation({
        per_page: repoPerPage,
        page: pageIndex + 1,
        type,
      }));
    const iteratedRepos = await Promise.all(reposPromises);
    const repositories = iteratedRepos.map(repo => repo.data.repositories.reverse()).flat();
    const hasMore = repoPerPage * repoPage < iteratedRepos[0].data.total_count;

    return {
      success: true,
      repositories,
      hasMore,
    };
  }
  catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return { success: false, error: "We can't list github repositories" };
  }
}

function isSuccessful(
  installation: Installation | FailedInstallation,
): installation is Installation {
  return !("failed" in installation);
}
