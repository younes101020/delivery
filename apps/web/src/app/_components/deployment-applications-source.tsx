import { DeploymentApplicationListProvider } from "../_ctx/deployment-application-list";
import { getGithubRepositoriesByGithubAppId } from "../_lib/github/repositories";
import { DeploymentGithubAppList } from "./deployment-github-apps";
import { DeploymentRepositories } from "./deployment-repositories";
import { RepositorySearch } from "./deployment-repository-search";

interface ApplicationSourceProps {
  defaultGithubAppsOpen?: boolean;
  sp: Promise<{
    page: string;
    githubapp?: string;
    step?: string;
    query?: string;
  } | undefined>;
}

export async function ApplicationSource({ defaultGithubAppsOpen = true, sp }: ApplicationSourceProps) {
  const searchParams = await sp;

  const repositoryPage = searchParams?.page ? Number.parseInt(searchParams.page) : 1;
  const githubAppId = searchParams?.githubapp ? Number.parseInt(searchParams.githubapp) : undefined;
  const queryRepository = searchParams?.query || "";

  const installationWithRepos = getGithubRepositoriesByGithubAppId(repositoryPage, githubAppId, queryRepository);

  return (
    <DeploymentApplicationListProvider repositoriesWithGithubAppPromise={installationWithRepos}>
      <div className="flex min-w-0 gap-4">
        <DeploymentGithubAppList defaultOpen={defaultGithubAppsOpen} />
        <div className="min-w-0 flex-1">
          <RepositorySearch />
          <DeploymentRepositories />
        </div>
      </div>
    </DeploymentApplicationListProvider>
  );
}
