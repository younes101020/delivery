import { Repository } from "@/lib/github";
import { test } from "vitest";

const repositories: Repository[] = [];

interface OnBoardingFixtures {
  repositories: Repository[];
}

export const onBoardingTest = test.extend<OnBoardingFixtures>({
  repositories: async ({}, use) => {
    repositories.push(
      {
        id: 1,
        full_name: "octocat/Hello-World",
        git_url: "git://github.com/octocat/Hello-World.git",
        description: "This is a sample repository",
      },
      {
        id: 2,
        full_name: "facebook/react",
        git_url: "git://github.com/facebook/react.git",
        description: "A JavaScript library for building user interfaces",
      },
      {
        id: 3,
        full_name: "vercel/next.js",
        git_url: "git://github.com/vercel/next.js.git",
        description: "The React Framework for Production",
      },
      {
        id: 4,
        full_name: "microsoft/typescript",
        git_url: "git://github.com/microsoft/typescript.git",
        description: "TypeScript is a superset of JavaScript",
      },
      {
        id: 5,
        full_name: "denoland/deno",
        git_url: "git://github.com/denoland/deno.git",
        description: "A modern runtime for JavaScript and TypeScript",
      },
    );
    await use(repositories);
    repositories.length = 0;
  },
});
