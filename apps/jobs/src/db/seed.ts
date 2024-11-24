import { drizzle } from "drizzle-orm/postgres-js";
import { seed } from "drizzle-seed";

import env from "@/env";

import { users } from "./schema";

async function main() {
  const db = drizzle(env.DATABASE_URL);
  await seed(db, { users });
}

main();
