import { faker } from "@faker-js/faker";
import { it as base } from "vitest";

import type { InsertGithubAppSchema } from "@/db/dto";

import { db } from "@/db";
import { githubApp } from "@/db/schema";

interface Fixtures {
  githubAppPayload: InsertGithubAppSchema;
  registeredGithubAppId: string;
}

const sensitiveValue = faker.string.hexadecimal({ length: 64, prefix: "" });
const githubAppPayload = {
  name: faker.internet.displayName(),
  webhookSecret: sensitiveValue,
  clientId: "1",
  clientSecret: sensitiveValue,
  appId: 1,
  privateKey: sensitiveValue,
  id: 5000,
};

export const it = base.extend<Fixtures>({
  githubAppPayload: async ({}, use) => {
    await use(githubAppPayload);
  },
  registeredGithubAppId: async ({}, use) => {
    const registeredGithubAppId = await getRandomRegisteredGithubAppId();
    await use(registeredGithubAppId);
  },
});

async function getRandomRegisteredGithubAppId() {
  const [registeredGithubApp] = await db.select({ id: githubApp.id }).from(githubApp).limit(1);
  return registeredGithubApp.id.toString();
}
