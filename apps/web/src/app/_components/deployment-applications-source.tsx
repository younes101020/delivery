import { DeploymentApplicationListProvider } from "../_ctx/deployment-application-list";
import { getGithubRepositoriesByGithubAppId } from "../_lib/github/repositories";
import { DeploymentGithubAppList } from "./deployment-github-apps";
import { DeploymentRepositories } from "./deployment-repositories";
import { RepositorySearch } from "./deployment-repository-search";

interface ApplicationSourceProps {
  sp: Promise<{
    page: string;
    githubapp?: string;
    step?: string;
    query?: string;
  }> | undefined;
}

export async function ApplicationSource({ sp }: ApplicationSourceProps) {
  const searchParams = await sp;

  const repositoryPage = searchParams?.page ? Number.parseInt(searchParams.page) : 1;
  const githubAppId = searchParams?.githubapp ? Number.parseInt(searchParams.githubapp) : undefined;
  const queryRepository = searchParams?.query || "";

  const installationWithRepos = getGithubRepositoriesByGithubAppId(repositoryPage, githubAppId, queryRepository);

  return (
    <DeploymentApplicationListProvider repositoriesWithGithubAppPromise={installationWithRepos}>
      <div className="grid grid-cols-4 gap-4">
        <DeploymentGithubAppList />
        <div className="col-span-3">
          <RepositorySearch />
          <DeploymentRepositories />
        </div>
      </div>
    </DeploymentApplicationListProvider>
  );
}
