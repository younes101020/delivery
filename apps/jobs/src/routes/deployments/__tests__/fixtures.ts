/* eslint-disable no-empty-pattern */
import { faker } from "@faker-js/faker";
import { it as base } from "vitest";

import type { DeploymentReferenceAndDataSchema } from "@/db/dto";

interface UTFixtures {
  repoUrl: string;
  installationAuthenticationToken: string;
  deployAppPayload: DeploymentReferenceAndDataSchema;
  githubApp: {
    id: number;
    name: string;
    webhookSecret: string;
    clientId: string;
    clientSecret: string;
    installationId: number;
    appId: number;
    secret: {
      githubAppId: number;
      id: number;
      encryptedData: string;
      iv: string;
      key: string;
    };
  };
  completedJobs: {
    name: string;
    data: {
      repoUrl?: string;
      port?: number;
      staticdeploy?: boolean;
      env?: string;
      repoName: string;
      publishdir?: string;
      cache?: boolean;
      fqdn?: string;
      application?: {
        port: number;
        githubAppId: number;
        name: string;
      };
      environmentVariable?: EnvironmentVariables["structured"];
    };
  }[];
  environmentVariable: EnvironmentVariables;
}

interface EnvironmentVariables {
  structured: {
    key: string;
    value: string;
  }[];
  plain: string;
}

const gitusername = faker.internet.username().toLowerCase();
const gitreponame = `${faker.word.sample().toLowerCase()}-${faker.word.sample().toLowerCase()}`;

const repoUrl = `git://github.com/${gitusername}/${gitreponame}`;
const installationAuthenticationToken = faker.string.alphanumeric(40);

const githubApp = {
  id: faker.number.int({ min: 1, max: 100 }),
  name: faker.company.name(),
  webhookSecret: faker.string.alphanumeric(32),
  clientId: faker.string.alphanumeric(20),
  clientSecret: faker.string.alphanumeric(40),
  installationId: faker.number.int({ min: 1, max: 1000 }),
  appId: faker.number.int({ min: 1, max: 100 }),
  secret: {
    githubAppId: faker.number.int({ min: 1, max: 100 }),
    id: faker.number.int({ min: 1, max: 100 }),
    encryptedData: faker.string.alphanumeric(64),
    iv: faker.string.alphanumeric(16),
    key: faker.string.alphanumeric(32),
  },
};

const staticdeploy = faker.datatype.boolean();

const deployAppPayload = {
  repoUrl,
  githubAppId: faker.number.int({ min: 1, max: 100 }),
  port: faker.number.int({ min: 3000, max: 9000 }),
  staticdeploy,
  env: `${faker.string.alphanumeric(8)}=${faker.string.alphanumeric(16)} ${faker.string.alphanumeric(8)}=${faker.string.alphanumeric(16)}`,
  publishdir: staticdeploy ? `/${faker.system.directoryPath()}` : undefined,
  cache: faker.datatype.boolean(),
} satisfies DeploymentReferenceAndDataSchema;

const completedJobs = [
  {
    name: "clone",
    data: {
      repoUrl,
      ...githubApp,
      repoName: gitreponame,
    },
  },
  {
    name: "build",
    data: {
      port: staticdeploy ? 80 : deployAppPayload.port,
      staticdeploy,
      env: deployAppPayload.env,
      cache: deployAppPayload.cache,
      fqdn: "https://my-app.domain.com",
      publishdir: deployAppPayload.publishdir,
      repoName: gitreponame,
    },
  },
  {
    name: "configure",
    data: {
      application: {
        port: staticdeploy ? 80 : deployAppPayload.port,
        githubAppId: githubApp.id,
        name: gitreponame,
      },
      environmentVariable: [
        { key: "VAR1", value: "VAL1" },
        { key: "VAR2", value: "VAL2" },
      ],
      fqdn: "https://my-app.domain.com",
      repoName: gitreponame,
    },
  },
];

const randomEnvironmentVariable = {
  key: faker.string.alphanumeric(8),
  value: faker.string.alphanumeric(12),
};

const environmentVariable = {
  plain: `${randomEnvironmentVariable.key}=${randomEnvironmentVariable.value} ${randomEnvironmentVariable.key}=${randomEnvironmentVariable.value}`,
  structured: [randomEnvironmentVariable],
};

export const it = base.extend<UTFixtures>({
  repoUrl: async ({}, use) => {
    await use(repoUrl);
  },
  installationAuthenticationToken: async ({}, use) => {
    await use(installationAuthenticationToken);
  },
  deployAppPayload: async ({}, use) => {
    await use(deployAppPayload);
  },
  githubApp: async ({}, use) => {
    await use(githubApp);
  },
  completedJobs: async ({}, use) => {
    await use(completedJobs);
  },
  environmentVariable: async ({}, use) => {
    await use(environmentVariable);
  },
});
