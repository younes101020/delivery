import { faker } from "@faker-js/faker";
import { it as base } from "vitest";

import type {
  InsertDeploymentSchema,
  InsertGithubAppsSchema,
  InsertUsersSchema,
} from "@/db/dto";
import type { QueueDeploymentJob, QueueDeploymentJobData } from "@/lib/tasks/deploy/types";

interface Fixtures {
  githubApps: InsertGithubAppsSchema[];
  users: InsertUsersSchema[];
  deployments: InsertDeploymentSchema & QueueDeploymentJobData;
  job: Partial<QueueDeploymentJob<"clone">>;
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
  cache: faker.datatype.boolean(),
  timeout: 50000,
  repoName: faker.system.fileName(),
  clone: {
    id: 1,
    appId: 1,
    clientId: "1",
    jobId: faker.number.int().toString(),
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
    token: faker.string.uuid(),
  },
  build: {
    jobId: faker.number.int().toString(),
    port: faker.internet.port().toString(),
    fqdn: faker.internet.domainName(),
    env: `KEY=${faker.string.sample()}`,
    token: faker.string.uuid(),
    cache: faker.datatype.boolean(),
  },
  configure: {
    jobId: faker.number.int().toString(),
    id: faker.number.int(),
    name: faker.system.fileName(),
    port: faker.internet.port().toString(),
    githubAppId: 1,
    fqdn: faker.internet.domainName(),
    githubAppName: faker.system.fileName(),
    application: {
      githubAppId: 1,
      port: faker.internet.port().toString(),
    },
    environmentVariable: undefined,
    logs: faker.lorem.sentence(),
  },
};

const job = {
  data: { ...deployments.clone, timeout: 50000, repoName: faker.system.fileName() },
  updateProgress: async () => Promise.resolve(),
  updateData: async () => Promise.resolve(),
  remove: async () => Promise.resolve(),
  getChildrenValues: async () => Promise.resolve({}),
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
