import { faker } from "@faker-js/faker";
import { it as base } from "vitest";

import type { JobDataMap, JobParam } from "@/lib/tasks/types";

import type {
  InsertDeploymentSchema,
  InsertGithubAppsSchema,
  InsertUsersSchema,
} from "../src/db/dto";

interface Fixtures {
  githubApps: InsertGithubAppsSchema[];
  users: InsertUsersSchema[];
  deployments: InsertDeploymentSchema & JobDataMap;
  job: JobParam<"clone">;
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

const deployments = {
  repoUrl: "git://github.com/user/repo",
  githubAppId: 1,
  port: faker.internet.port().toString(),
  clone: {
    id: 1,
    appId: 1,
    clientId: "1",
    clientSecret: faker.internet.password(),
    webhookSecret: faker.internet.password(),
    secretId: 4,
    installationId: faker.number.int(),
    secret: {
      id: 4,
      encryptedData: faker.string.alphanumeric(64),
      iv: faker.string.alphanumeric(32),
      key: faker.string.alphanumeric(32),
    },
    repoUrl: faker.internet.url(),
    repoName: faker.system.fileName(),
  },
  build: {
    repoName: faker.system.fileName(),
    port: faker.internet.port().toString(),
    env: `KEY=${faker.string.sample()}`,
  },
};

const job = {
  data: deployments.clone,
  updateProgress: async () => Promise.resolve(),
};

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
  // eslint-disable-next-line no-empty-pattern
  job: async ({}, use) => {
    await use(job);
  },
});
