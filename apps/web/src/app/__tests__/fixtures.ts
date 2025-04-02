import { it } from "vitest";

import type { GithubApp, GithubRepositories } from "@/app/_lib/github/types";

interface DeploymentFixtures {
  repositories: GithubRepositories;
  githubApps: GithubApp[];
}

export const deploymentTest = it.extend<DeploymentFixtures>({
  // eslint-disable-next-line no-empty-pattern
  repositories: async ({}, inject) => {
    const repositories = {
      repositories: [{
        id: 1,
        full_name: "octocat/Hello-World",
        git_url: "git://github.com/octocat/Hello-World.git",
        description: "This is a sample repository",
      }, {
        id: 2,
        full_name: "facebook/react",
        git_url: "git://github.com/facebook/react.git",
        description: "A JavaScript library for building user interfaces",
      }, {
        id: 3,
        full_name: "vercel/next.js",
        git_url: "git://github.com/vercel/next.js.git",
        description: "The React Framework for Production",
      }, {
        id: 4,
        full_name: "microsoft/typescript",
        git_url: "git://github.com/microsoft/typescript.git",
        description: "TypeScript is a superset of JavaScript",
      }, {
        id: 5,
        full_name: "denoland/deno",
        git_url: "git://github.com/denoland/deno.git",
        description: "A modern runtime for JavaScript and TypeScript",
      }],
      githubApp: { appId: 4578, name: "mygithubaap" },
      hasMore: Math.random() < 0.5,
    };
    await inject(repositories);
  },
  // eslint-disable-next-line no-empty-pattern
  githubApps: async ({}, inject) => {
    const githubApps = [
      { appId: 1234, name: "GitHub App 1" },
      { appId: 5678, name: "GitHub App 2" },
      { appId: 9012, name: "GitHub App 3" },
    ];
    await inject(githubApps);
  },
});
