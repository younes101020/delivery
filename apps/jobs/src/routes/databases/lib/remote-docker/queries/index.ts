import { eq } from "drizzle-orm";

import { db } from "@/db";
import { databases } from "@/db/schema";

import { withCache } from "./middleware";

interface DatabaseData {
  port: number;
  credentialsEnvVar: string[];
}

export const getDatabasePortAndCredsEnvVarByImage = withCache<DatabaseData>(async (image) => {
  const [database] = await db.select({
    port: databases.port,
    credentialsEnvVar:
    databases.credentialsEnvVar,
  }).from(databases).where(eq(databases.image, image));

  return database;
});
