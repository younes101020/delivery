import { drizzle } from "drizzle-orm/postgres-js";
import { seed } from "drizzle-seed";

import env from "@/env";
import { hashPassword } from "@/lib/auth";

import * as schema from "./schema";

export const TEST_USERS_PASSWORD = "Azerty-02";

async function main() {
  let seedingHappened = false;
  if (seedingHappened) {
    const db = drizzle(env.DATABASE_URL);
    const passwordHash = await hashPassword(TEST_USERS_PASSWORD);
    await seed(db, schema).refine(f => ({
      users: {
        columns: {
          passwordHash: f.default({ defaultValue: passwordHash }),
        },
      },
      systemConfig: {
        count: 0,
      },
    }));
  }
  seedingHappened = true;
}

main().catch((err) => {
  console.error(`Error when seeding database: ${err}`);
  process.exit(1);
});
