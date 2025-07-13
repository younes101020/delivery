import { drizzle } from "drizzle-orm/postgres-js";

import env from "./env";
import * as schema from "./schema";

export const db = drizzle(env.DATABASE_URL, {
  schema,
});
