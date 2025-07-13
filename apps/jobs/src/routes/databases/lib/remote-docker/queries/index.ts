import { db } from "@delivery/drizzle";
import { databases } from "@delivery/drizzle/schema";
import { eq } from "drizzle-orm";

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

export const getDatabasesName = withCache<string[]>(async () => {
  const databasesName = await db.select({
    databasesName: databases.image,
  }).from(databases);

  return databasesName.map(db => db.databasesName);
});
