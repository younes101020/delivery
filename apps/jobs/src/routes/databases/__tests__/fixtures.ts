import { it as base } from "vitest";

import type { CreateDatabaseSchema } from "@/db/dto/databases.dto";

interface ITFixtures {
  database: CreateDatabaseSchema;
}

export const it = base.extend<ITFixtures>({
  database: async ({}, use) => {
    const typePayload = ["mysql", "mariadb", "postgres", "mongo", "redis"] as const;
    const name = ["mydb", "mydb2", "mydb3", "mydb4", "mydb5"];
    const database: CreateDatabaseSchema = {
      type: typePayload[Math.floor(Math.random() * 6)],
      name: name[Math.floor(Math.random() * 6)],
    };
    await use(database);
  },
});
