import { drizzle } from "drizzle-orm/postgres-js";
import { reset } from "drizzle-seed";

import env from "@/env";

import * as schema from "./schema";

async function main() {
  const db = drizzle(env.DATABASE_URL);
  await reset(db, schema);
  process.exit(0);
}

main();
