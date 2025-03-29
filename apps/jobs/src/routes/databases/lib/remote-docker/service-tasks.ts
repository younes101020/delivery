import type { Database } from "@/db/dto";

import { DatabaseError } from "@/lib/error";

import { DEFAULT_DATABASES_CREDENTIALS_ENV_VAR_NOT_FOUND_ERROR_MESSAGE } from "./const";
import { getDatabaseEnvVarsCredential } from "./utils";

interface CreateDatabase {
  databaseImage: Database;
  databaseName: string;
}
export function createDatabase({ databaseImage }: CreateDatabase) {
  const credentialsEnvVars = getDatabaseEnvVarsCredential(databaseImage);
  if (!credentialsEnvVars) {
    throw new DatabaseError({
      name: "CREATE_DATABASE_ERROR",
      message: DEFAULT_DATABASES_CREDENTIALS_ENV_VAR_NOT_FOUND_ERROR_MESSAGE,
    });
  }
}
