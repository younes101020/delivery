import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";

export type RepositoriesResult = Awaited<
  ReturnType<Octokit["apps"]["listReposAccessibleToInstallation"]>
>["data"]["repositories"];

type SuccessResult = {
  success: true;
  repositories: RepositoriesResult;
  totalCount: number;
};

type ErrorResult = {
  success: false;
  error: string;
};
type ListInstallationRepositoriesResult = SuccessResult | ErrorResult;

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

    const { data } = await installationOctokit.apps.listReposAccessibleToInstallation({
      per_page: repoPerPage,
      page: repoPage,
      type,
    });

    return {
      success: true,
      repositories: data.repositories.reverse(),
      totalCount: data.total_count,
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
