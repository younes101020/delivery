import type { Octokit } from "@octokit/rest";

export type Repository = {
  id: number;
  full_name: string;
  git_url: string;
  description: string | null;
};

export type Installation = {
  githubAppId: number;
  repositories: Repository[];
  hasMore: boolean;
};

export interface FailedInstallation {
  failed: true;
}

export type RepositoriesResult = Awaited<
  ReturnType<Octokit["apps"]["listReposAccessibleToInstallation"]>
>["data"]["repositories"];

type SuccessResult = {
  success: true;
  repositories: RepositoriesResult;
  hasMore: boolean;
};

type ErrorResult = {
  success: false;
  error: string;
};

export type ListInstallationRepositoriesResult = SuccessResult | ErrorResult;
