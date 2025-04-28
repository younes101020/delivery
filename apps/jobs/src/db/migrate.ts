import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "node:path";

import { databases as databasesConst } from "@/routes/databases/lib/remote-docker/const";

import { db } from ".";
import { databases } from "./schema";

async function main() {
  await migrate(db, {
    migrationsFolder: path.join(process.cwd(), "/apps/jobs/src/db/migrations"),
  });

  await seedWithDatabaseConstants();
  // eslint-disable-next-line no-console
  console.log("🛢 Database resource migrations applied successfully");

  process.exit(0);
}

main().catch((err) => {
  console.error(`Error when applying migrations: ${err}`);
  process.exit(1);
});

async function seedWithDatabaseConstants() {
  const alreadyExists = await db.select({ id: databases.id }).from(databases);
  if (alreadyExists.length === 0) {
    return Promise.all(
      databasesConst.map(async ({ image, port, databaseCredentialsEnvVar }) => {
        return db.insert(databases).values({
          image,
          port,
          credentialsEnvVar: databaseCredentialsEnvVar,
        });
      }),
    );
  }
}
