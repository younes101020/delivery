import { drizzle } from "drizzle-orm/postgres-js";

import env from "./env.js";
import * as schema from "./schema.js";

export const db = drizzle(env.DATABASE_URL, {
  schema,
});
