import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "node:path";

import { db } from ".";

async function main() {
  await migrate(db, {
    migrationsFolder: path.join(process.cwd(), "/src/db/migrations"),
  });
  process.exit(0);
}

main().catch((err) => {
  console.error(`Error when applying migrations: ${err}`);
  process.exit(1);
});
