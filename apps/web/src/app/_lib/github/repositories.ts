import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";

import { getAllGithubApp } from "./queries";

// Aggregates just the essential github repositories data needed by the frontend
export async function getGithubRepositories(repoPage: number) {
  const githubApps = await getAllGithubApp();
  if (!githubApps) {
    return null;
  }

  const installations = await Promise.all(
    githubApps.map(async (installation) => {
      const repositoriesResponse = await listGithubRepositories({
        appId: installation.appId.toString(),
        privateKey: installation.privateKey,
        installationId: installation.installationId.toString(),
        repoPage,
      });

      const { repositories, hasMore } = repositoriesResponse;

      return {
        githubAppId: installation.appId,
        name: installation.name,
        repositories: repositories
          ? repositories.map(repo => ({
              id: repo.id,
              full_name: repo.full_name,
              git_url: repo.git_url,
              description: repo.description,
            }))
          : [],
        hasMore: typeof hasMore === "undefined" ? false : hasMore,
      };
    }),
  );

  return installations;
}

// This function fetches paginated github repositories data from a single GitHub installation
async function listGithubRepositories({
  appId,
  privateKey,
  installationId,
  repoPerPage = 5,
  repoPage = 1,
}: {
  appId: string;
  privateKey: string | null;
  installationId: string;
  repoPerPage?: number;
  repoPage?: number;
}) {
  "use cache";
  try {
    const installation = await getGithubAppInstallation({ appId, privateKey, installationId });

    const reposPromises = Array.from({ length: repoPage }, (_, pageIndex) =>
      installation.apps.listReposAccessibleToInstallation({
        per_page: repoPerPage,
        page: pageIndex + 1,
        type: "all",
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

// see: https://docs.github.com/en/rest/apps/installations?apiVersion=2022-11-28
async function getGithubAppInstallation({ appId, privateKey, installationId }: { appId: string; privateKey: string | null; installationId: string }) {
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

  const installation = new Octokit({
    auth: token,
  });

  return installation;
}
