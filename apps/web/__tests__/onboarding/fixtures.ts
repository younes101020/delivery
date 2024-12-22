import { Repository } from "@/lib/github";
import { test } from "vitest";

type User = {
  email: string;
  password: string;
  registered: boolean;
};

const repositories: (Repository & { githubAppId: number })[] = [];
const users: User[] = [];

interface OnBoardingFixtures {
  repositories: (Repository & { githubAppId: number })[];
  users: User[];
}

export const onBoardingTest = test.extend<OnBoardingFixtures>({
  repositories: async ({}, use) => {
    repositories.push(
      {
        id: 1,
        full_name: "octocat/Hello-World",
        git_url: "git://github.com/octocat/Hello-World.git",
        description: "This is a sample repository",
        githubAppId: 10,
      },
      {
        id: 2,
        full_name: "facebook/react",
        git_url: "git://github.com/facebook/react.git",
        description: "A JavaScript library for building user interfaces",
        githubAppId: 10,
      },
      {
        id: 3,
        full_name: "vercel/next.js",
        git_url: "git://github.com/vercel/next.js.git",
        description: "The React Framework for Production",
        githubAppId: 10,
      },
      {
        id: 4,
        full_name: "microsoft/typescript",
        git_url: "git://github.com/microsoft/typescript.git",
        description: "TypeScript is a superset of JavaScript",
        githubAppId: 10,
      },
      {
        id: 5,
        full_name: "denoland/deno",
        git_url: "git://github.com/denoland/deno.git",
        description: "A modern runtime for JavaScript and TypeScript",
        githubAppId: 10,
      },
    );
    await use(repositories);
    repositories.length = 0;
  },
  users: async ({}, use) => {
    users.push(
      {
        email: "test@example.com",
        password: "Azerty-60",
        registered: true,
      },
      {
        email: "jane@example.com",
        password: "password456",
        registered: false,
      },
      {
        email: "bob@example.com",
        password: "password789",
        registered: false,
      },
    );
    await use(users);
    users.length = 0;
  },
});
