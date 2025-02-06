import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";

import { getAllGithubApp } from "./queries";

export async function getGithubRepositoriesByGithubAppId(repoPage: number, githubAppId?: number) {
  const githubApps = await getAllGithubApp();
  if (!githubApps)
    return null;

  const githubApp = githubAppId ? githubApps.find(githubApp => githubApp.appId === githubAppId) : githubApps[0];

  if (!githubApp)
    return null;

  const repositories = await aggregateGithubRepositories({ appId: githubApp.appId.toString(), privateKey: githubApp.privateKey, installationId: githubApp.installationId.toString(), repoPage });

  return {
    repositories: { ...repositories, githubApp },
    githubApps: githubApps.map(ghApp => ({ appId: ghApp.appId, name: ghApp.name })),
  };
}

async function aggregateGithubRepositories({ appId, privateKey, installationId, repoPage }:
{ appId: string; privateKey: string | null; installationId: string; repoPage: number }) {
  const repositoriesResponse = await listGithubRepositories({
    appId,
    privateKey,
    installationId,
    repoPage,
  });

  const { repositories, hasMore } = repositoriesResponse;

  return {
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
