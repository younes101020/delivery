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
  perPage = 50,
  type = "all",
}: { [key: string]: string } & { perPage?: number }): Promise<ListInstallationRepositoriesResult> {
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

    const repositories = [];
    let page = 1;

    while (true) {
      const {
        data: { repositories: repos },
      } = await installationOctokit.apps.listReposAccessibleToInstallation({
        per_page: perPage,
        page,
        type,
      });

      repositories.push(...repos);

      if (repos.length < perPage) break;
      page++;
    }

    return {
      success: true,
      repositories,
      totalCount: repositories.length,
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
