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
  () => ({
    name: faker.person.firstName(),
    email: faker.internet.email(),
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
  githubApps: async (_, use) => {
    await use(githubApps);
  },
  users: async (_, use) => {
    await use(users);
  },
  deployments: async (_, use) => {
    await use(deployments);
  },
});
