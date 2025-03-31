import type { Database } from "@/db/dto";

import { DatabaseError } from "@/lib/error";
import { getDocker } from "@/lib/remote-docker";

import { DEFAULT_DATABASES_CREDENTIALS_ENV_VAR_NOT_FOUND_ERROR_MESSAGE } from "./const";
import { createDatabaseServiceSpec } from "./manifest";
import { getDatabasePortAndCredsEnvVarByImage } from "./queries";
import { getDatabaseEnvVarsCredential } from "./utils";

interface CreateDatabase {
  databaseImage: Database;
  databaseName: string;
}

export async function createDatabase({ databaseImage, databaseName }: CreateDatabase) {
  const credentialsEnvVars = getDatabaseEnvVarsCredential(databaseImage);
  if (!credentialsEnvVars) {
    throw new DatabaseError({
      name: "CREATE_DATABASE_ERROR",
      message: DEFAULT_DATABASES_CREDENTIALS_ENV_VAR_NOT_FOUND_ERROR_MESSAGE,
    });
  }
  const docker = await getDocker();
  const database = await getDatabasePortAndCredsEnvVarByImage(databaseImage);
  const dbSpec = createDatabaseServiceSpec({
    database: databaseImage,
    name: databaseName,
    port: database.port,
    initialEnvCreds: database.credentialsEnvVar,
  });
  await docker.createContainer(dbSpec).catch((error) => {
    throw new DatabaseError({
      name: "CREATE_DATABASE_ERROR",
      message: error instanceof Error ? error.message : "Unexpected error",
    });
  });
}
