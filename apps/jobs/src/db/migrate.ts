import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "node:path";

import env from "@/env";

import { db } from ".";

async function main() {
  const migrationsFolder = path.join(process.cwd(), env.NODE_ENV === "production" ? "/apps/jobs/src/db/migrations" : "/src/db/migrations");

  await migrate(db, {
    migrationsFolder,
  });

  // eslint-disable-next-line no-console
  console.log("🛢 Database resource migrations applied successfully");

  process.exit(0);
}

main().catch((err) => {
  console.error(`Error when applying migrations: ${err}`);
  process.exit(1);
});
