export interface Repository {
  id: number;
  full_name: string;
  git_url: string;
  description: string | null;
}

export interface GithubRepositories {
  githubAppId: number;
  repositories: Repository[];
  hasMore: boolean;
}
