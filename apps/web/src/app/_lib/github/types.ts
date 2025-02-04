import type { Octokit } from "@octokit/rest";

export interface Repository {
  id: number;
  full_name: string;
  git_url: string;
  description: string | null;
}

export interface Installation {
  githubAppId: number;
  repositories: Repository[];
  hasMore: boolean;
}

export interface FailedInstallation {
  failed: true;
}

export type RepositoriesResult = Awaited<
  ReturnType<Octokit["apps"]["listReposAccessibleToInstallation"]>
>["data"]["repositories"];

interface SuccessResult {
  success: true;
  repositories: RepositoriesResult;
  hasMore: boolean;
}

interface ErrorResult {
  success: false;
  error: string;
}

export type ListInstallationRepositoriesResult = SuccessResult | ErrorResult;
