import { it } from "vitest";

import type { Installation } from "@/app/_lib/github/types";

interface User {
  email: string;
  password: string;
  registered: boolean;
}

const installations: Installation[] = [];
const users: User[] = [];

interface OnBoardingFixtures {
  installations: Installation[];
  users: User[];
}

export const onBoardingTest = it.extend<OnBoardingFixtures>({
  // eslint-disable-next-line no-empty-pattern
  installations: async ({}, inject) => {
    installations[0].repositories.push(
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
    installations[0].githubAppId = 10;
    installations[0].hasMore = true;
    await inject(installations);
    installations.length = 0;
  },
  // eslint-disable-next-line no-empty-pattern
  users: async ({}, inject) => {
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
    await inject(users);
    users.length = 0;
  },
});
