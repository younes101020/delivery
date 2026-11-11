import { encryptSecret, hashPassword } from "@delivery/utils";
import { faker } from "@faker-js/faker";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { seed } from "drizzle-seed";

import env from "../env";
import * as schema from "../schema";

async function main() {
  const db = drizzle(env.DATABASE_URL);
  const passwordHash = await hashPassword(env.TEST_USERS_PASSWORD!);

  const GITHUB_APP_PRIVATE_KEY
= `
  mL+IHQ/AH6tF0KMlJGQn+IrPIbdkfGJz4I3qVo7yp7JFN3lLfZ/ndndcE+kHGc3R
  rNntHJbXa1rDMDDpP4lmCtmMaX2hYcSsqhN4iQIDAQABAoIBAHfZe0e4zYpR3mGW
  xvd6rCX9Jf3dIJ8nVzzSEk3ZOhtUEZYG+PcZLh6jwwFH1wO7K+LwFlBNr/RMaBOU`;
  const SECRET = await encryptSecret(GITHUB_APP_PRIVATE_KEY);

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
          values: ["pending"],
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
        SELECT
            sequence_namespace.nspname AS sequence_schema,
            sequence_class.relname AS sequence_name,
            table_namespace.nspname AS table_schema,
            table_class.relname AS table_name,
            table_column.attname AS column_name
        FROM pg_class AS sequence_class
        JOIN pg_namespace AS sequence_namespace
            ON sequence_namespace.oid = sequence_class.relnamespace
        JOIN pg_depend AS sequence_dependency
            ON sequence_dependency.objid = sequence_class.oid
            AND sequence_dependency.deptype IN ('a', 'i')
        JOIN pg_class AS table_class
            ON table_class.oid = sequence_dependency.refobjid
        JOIN pg_namespace AS table_namespace
            ON table_namespace.oid = table_class.relnamespace
        JOIN pg_attribute AS table_column
            ON table_column.attrelid = table_class.oid
            AND table_column.attnum = sequence_dependency.refobjsubid
        WHERE sequence_class.relkind = 'S'
            AND sequence_namespace.nspname = 'public'
            AND table_namespace.nspname = 'public'
    LOOP
        EXECUTE format(
            'SELECT setval(%L, COALESCE((SELECT MAX(%I) FROM %I.%I), 1), EXISTS (SELECT 1 FROM %I.%I))',
            seq_record.sequence_schema || '.' || seq_record.sequence_name,
            seq_record.column_name,
            seq_record.table_schema,
            seq_record.table_name,
            seq_record.table_schema,
            seq_record.table_name
        );
    END LOOP;
END $$;`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(`Error when seeding database: ${err}`);
  process.exit(1);
});
