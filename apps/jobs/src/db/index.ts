import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "./schema";

export const client = new Database("sqlite.db");
export const db = drizzle(client, {
  schema,
});
