export interface Repository {
  id: number;
  full_name: string;
  git_url: string;
  description: string | null;
}

export interface GithubRepositories {
  repositories: Repository[];
  hasMore: boolean;
  githubApp: GithubApp;
}

export interface GithubApp {
  appId: number;
  name: string;
}
