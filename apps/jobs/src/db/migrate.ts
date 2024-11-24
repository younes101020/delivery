import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "node:path";

import { db } from ".";

function main() {
  migrate(db, {
    migrationsFolder: path.join(process.cwd(), "/src/db/migrations"),
  });
}

main();
