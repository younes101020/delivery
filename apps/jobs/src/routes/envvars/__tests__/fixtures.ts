import { faker } from "@faker-js/faker";
import { it as base } from "vitest";

import type { InsertEnvironmentVariablesSchema } from "@/lib/dto/envvars.dto";

interface Fixtures {
  envVarAppPayload: InsertEnvironmentVariablesSchema;
}

const envVarAppPayload = {
  key: faker.word.words({ count: { min: 1, max: 3 } })
    .split(" ")
    .map(word => word.toUpperCase())
    .join("_"),
  value: faker.string.alphanumeric({ length: { min: 8, max: 32 } }),
};

export const it = base.extend<Fixtures>({
  envVarAppPayload: async ({}, use) => {
    await use(envVarAppPayload);
  },
});
