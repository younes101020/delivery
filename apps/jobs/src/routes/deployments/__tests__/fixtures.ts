import { faker } from "@faker-js/faker";
import { it as base } from "vitest";

interface UTFixtures {
  repoUrl: string;
  installationAuthenticationToken: string;
}

const gitusername = faker.internet.username().toLowerCase();
const gitreponame = `${faker.word.sample().toLowerCase()}-${faker.word.sample().toLowerCase()}`;

const repoUrl = `git://github.com/${gitusername}/${gitreponame}`;
const installationAuthenticationToken = faker.string.alphanumeric(40);

export const it = base.extend<UTFixtures>({
  // eslint-disable-next-line no-empty-pattern
  repoUrl: async ({}, use) => {
    await use(repoUrl);
  },
  // eslint-disable-next-line no-empty-pattern
  installationAuthenticationToken: async ({}, use) => {
    await use(installationAuthenticationToken);
  },
});
