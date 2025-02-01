import { faker } from "@faker-js/faker";
import { it as base } from "vitest";

import type { InsertGithubAppSchema } from "@/db/dto";

import { db } from "@/db";
import { githubApp } from "@/db/schema";

interface Fixtures {
  githubAppPayload: InsertGithubAppSchema;
  registeredGithubAppId: string;
}

export const it = base.extend<Fixtures>({
  // eslint-disable-next-line no-empty-pattern
  githubAppPayload: async ({}, use) => {
    const sensitiveValue = faker.string.hexadecimal({ length: 64, prefix: "" });
    const githubAppPayload = {
      webhookSecret: sensitiveValue,
      clientId: "1",
      clientSecret: sensitiveValue,
      appId: 1,
      privateKey: sensitiveValue,
    };
    await use(githubAppPayload);
  },
  // eslint-disable-next-line no-empty-pattern
  registeredGithubAppId: async ({}, use) => {
    const registeredGithubAppId = await getRandomRegisteredGithubAppId();
    await use(registeredGithubAppId);
  },
});

async function getRandomRegisteredGithubAppId() {
  const [registeredGithubApp] = await db.select({ id: githubApp.id }).from(githubApp).limit(1);
  return registeredGithubApp.id.toString();
}
