import type { GithubRepositories, Repository } from "./types";

import { getGithubApp } from "./client";
import { getAllGithubAppCreds } from "./queries";

export async function getGithubRepositoriesByGithubAppId(repoPage: number, githubAppId?: number, query?: string) {
  const githubApps = await getAllGithubAppCreds();
  if (!githubApps)
    return null;

  const githubApp = githubAppId ? githubApps.find(githubApp => githubApp.appId === githubAppId) : githubApps[0];

  if (!githubApp)
    return null;

  const repositories = await getGithubRepositories({
    appId: githubApp.appId.toString(),
    privateKey: githubApp.privateKey,
    installationId: githubApp.installationId.toString(),
    repoPage,
    query,
  });

  return {
    repositories: { ...repositories, githubApp, isPending: false },
    githubApps: githubApps.map(ghApp => ({ appId: ghApp.appId, name: ghApp.name })),
  };
}

export type RepositoriesWithGithubAppPromise = ReturnType<typeof getGithubRepositoriesByGithubAppId>;
export type RepositoriesWithGithubApp = Awaited<ReturnType<typeof getGithubRepositoriesByGithubAppId>>;

interface GetGithubRepositories {
  appId: string;
  privateKey: string | null;
  installationId: string;
  repoPage: number;
  query?: string;
}

async function getGithubRepositories({ query, appId, privateKey, installationId, repoPage }: GetGithubRepositories) {
  const githubApp = await getGithubApp({ appId, privateKey, installationId, authType: "installation" });

  if (query) {
    const UNREACHABLE_REPOSITORY_COUNT = 500;

    const repositories = await githubApp.listReposAccessibleToInstallation({
      per_page: UNREACHABLE_REPOSITORY_COUNT,
      page: 1,
    });

    const filteredRepositories = queryRepositoriesByName(repositories.data.repositories, query);

    return toRepository({
      repositories: filteredRepositories,
      hasMore: repositories.data.total_count > UNREACHABLE_REPOSITORY_COUNT,
    });
  }

  const repositoriesResponse = await listGithubRepositoriesByPagination({
    appId,
    privateKey,
    installationId,
    repoPage,
  });

  return toRepository(repositoriesResponse);
}

function toRepository(githubRepositories: Omit<GithubRepositories, "githubApp">) {
  const { repositories, hasMore } = githubRepositories;
  return {
    repositories: repositories
      ? repositories.map(repo => ({
          id: repo.id,
          full_name: repo.full_name,
          git_url: repo.git_url,
          description: repo.description,
          name: repo.name,
        }))
      : [],
    hasMore: typeof hasMore === "undefined" ? false : hasMore,
  };
}

// This function fetches paginated github repositories data from a single GitHub app installation
async function listGithubRepositoriesByPagination({
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
  const githubApp = await getGithubApp({ appId, privateKey, installationId, authType: "installation" });

  const reposPromises = Array.from({ length: repoPage }, (_, pageIndex) =>
    githubApp.listReposAccessibleToInstallation({
      per_page: repoPerPage,
      page: pageIndex + 1,
    }));
  const iteratedRepos = await Promise.all(reposPromises);
  const repositories = iteratedRepos.map(repo => repo.data.repositories.reverse()).flat();
  const hasMore = repoPerPage * repoPage < iteratedRepos[0].data.total_count;

  return {
    repositories,
    hasMore,
  };
}

function queryRepositoriesByName(repositories: Repository[], query: string) {
  return repositories.filter((repo) => {
    const lowerCaseQuery = query.toLowerCase();
    return repo.name.toLowerCase().includes(lowerCaseQuery) || repo.full_name.toLowerCase().includes(lowerCaseQuery);
  });
}
