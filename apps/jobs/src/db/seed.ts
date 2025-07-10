import { faker } from "@faker-js/faker";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { seed } from "drizzle-seed";

import env from "@/env";
import { hashPassword } from "@/lib/auth";
import { encryptSecret } from "@/lib/utils";

import * as schema from "./schema";

const GITHUB_APP_PRIVATE_KEY
= `
  mL+IHQ/AH6tF0KMlJGQn+IrPIbdkfGJz4I3qVo7yp7JFN3lLfZ/ndndcE+kHGc3R
  rNntHJbXa1rDMDDpP4lmCtmMaX2hYcSsqhN4iQIDAQABAoIBAHfZe0e4zYpR3mGW
  xvd6rCX9Jf3dIJ8nVzzSEk3ZOhtUEZYG+PcZLh6jwwFH1wO7K+LwFlBNr/RMaBOU`;
const SECRET = await encryptSecret(GITHUB_APP_PRIVATE_KEY);

async function main() {
  const db = drizzle(env.DATABASE_URL);
  const passwordHash = await hashPassword(env.TEST_USERS_PASSWORD!);

  const randomEmails = Array.from({ length: env.TEST_ENTITY_COUNT }, () => faker.internet.email());
  const primaryIds = Array.from({ length: env.TEST_ENTITY_COUNT }, (_, i) => i + 1);
  // Add an extra ID for the existing user
  const userPrimaryIds = env.CI === "true" || env.NODE_ENV === "test" ? primaryIds : Array.from({ length: env.TEST_ENTITY_COUNT + 1 }, (_, i) => i + 1);

  await seed(db, schema, { count: env.TEST_ENTITY_COUNT }).refine(f => ({
    users: {
      with: {
        teamMembers: 1,
      },
      columns: {
        passwordHash: f.default({ defaultValue: passwordHash }),
        email: f.valuesFromArray({
          values: randomEmails,
        }),
      },
    },
    invitations: {
      columns: {
        status: f.valuesFromArray({
          values: ["pending", "accepted"],
        }),
        role: f.valuesFromArray({
          values: ["owner", "member"],
        }),
        email: f.valuesFromArray({
          values: randomEmails,
        }),
      },
    },
    teams: {
      with: {
        teamMembers: 5,
      },
    },
    teamMembers: {
      columns: {
        role: f.valuesFromArray({
          values: ["owner", "member"],
        }),
        userId: f.valuesFromArray({
          values: userPrimaryIds,
        }),
        teamId: f.valuesFromArray({
          values: primaryIds,
        }),
      },
    },
    githubApp: {
      with: {
        applications: 10,
        githubAppSecret: 1,
      },
    },
    githubAppSecret: {
      columns: {
        key: f.default({ defaultValue: SECRET.key }),
        iv: f.default({ defaultValue: SECRET.iv }),
        encryptedData: f.default({ defaultValue: SECRET.encryptedData }),
      },
    },
    systemConfig: {
      count: 0,
    },
  }));
  await db.execute(
    sql`DO $$
DECLARE
    seq_record record;
BEGIN
    FOR seq_record IN 
        SELECT schemaname, sequencename 
        FROM pg_sequences 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('SELECT setval(%L, ${sql.raw((env.TEST_ENTITY_COUNT + 1).toString())})', 
            seq_record.schemaname || '.' || seq_record.sequencename);
    END LOOP;
END $$;`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(`Error when seeding database: ${err}`);
  process.exit(1);
});
