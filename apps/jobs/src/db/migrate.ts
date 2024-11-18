import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";
import { db } from ".";

async function main() {
  await migrate(db, {
    migrationsFolder: path.join(process.cwd(), "/src/db/migrations"),
  });
}

main();
