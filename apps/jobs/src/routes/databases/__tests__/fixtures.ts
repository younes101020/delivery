import { it as base } from "vitest";

import type { CreateDatabaseSchema } from "@/db/dto/databases.dto";

interface ITFixtures {
  database: CreateDatabaseSchema;
}

export const it = base.extend<ITFixtures>({
  // eslint-disable-next-line no-empty-pattern
  database: async ({}, use) => {
    const typePayload = ["mysql", "mariadb", "postgresql", "mongodb", "redis", "sqlite"] as const;
    const database: CreateDatabaseSchema = {
      type: typePayload[Math.floor(Math.random() * 6)],
    };
    await use(database);
  },
});
