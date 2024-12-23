import { faker } from "@faker-js/faker";
import { it as base } from "vitest";

import type {
  InsertDeploymentSchema,
  InsertGithubAppsSchema,
  InsertUsersSchema,
} from "../src/db/dto";

interface Fixtures {
  githubApps: InsertGithubAppsSchema[];
  users: InsertUsersSchema[];
  deployments: InsertDeploymentSchema[];
}

const githubApps = faker.helpers.multiple(
  (_, i) => ({
    clientId: i.toString(),
    appId: i,
    clientSecret: faker.internet.password(),
    webhookSecret: faker.internet.password(),
    privateKey: faker.internet.password(),
  }),
  { count: 10 },
);

const users = faker.helpers.multiple(
  (_, i) => ({
    name: faker.person.firstName(),
    email: i === 0 ? "test@example.com" : faker.internet.email(),
    passwordHash: faker.internet.password(),
  }),
  { count: 10 },
);

const deployments = faker.helpers.multiple(
  (_, i) => ({
    repoUrl: faker.internet.url(),
    githubAppId: i,
  }),
  { count: 10 },
);

export const it = base.extend<Fixtures>({
  // eslint-disable-next-line no-empty-pattern
  githubApps: async ({}, use) => {
    await use(githubApps);
  },
  // eslint-disable-next-line no-empty-pattern
  users: async ({}, use) => {
    await use(users);
  },
  // eslint-disable-next-line no-empty-pattern
  deployments: async ({}, use) => {
    await use(deployments);
  },
});
