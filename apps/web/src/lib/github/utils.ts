import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";
import type { ListInstallationRepositoriesResult } from "./types";

export async function listInstallationRepositories({
  appId,
  privateKey,
  installationId,
  repoPerPage = 5,
  repoPage = 1,
  type = "all",
}: {
  appId: string;
  privateKey: string;
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
      }),
    );
    const iteratedRepos = await Promise.all(reposPromises);
    const repositories = iteratedRepos.map((repo) => repo.data.repositories.reverse()).flat();
    const hasMore = repoPerPage * repoPage < iteratedRepos[0].data.total_count;

    return {
      success: true,
      repositories,
      hasMore,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return { success: false, error: "We can't list github repositories" };
  }
}
