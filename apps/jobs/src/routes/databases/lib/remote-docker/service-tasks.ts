import type Dockerode from "dockerode";

import type { Database } from "@/db/dto";

import { DatabaseError } from "@/lib/error";
import { withDocker } from "@/lib/remote-docker/middleware";

import { DATABASE_INSTANCE_REPLICAS, DEFAULT_DATABASES_CREDENTIALS_ENV_VAR_NOT_FOUND_ERROR_MESSAGE, MISSING_DATABASE_NAME_AND_IMAGE_ERROR_MESSAGE } from "./const";
import { createDatabaseServiceSpec } from "./manifest";
import { getDatabasePortAndCredsEnvVarByImage } from "./queries";
import { withDatabaseService } from "./service-middleware";
import { createDatabaseEnvVarsCredential } from "./utils";

interface CreateDatabase {
  databaseImage: Database;
  databaseName: string;
}

export const createDatabaseService = withDocker<DatabaseError | Dockerode.Service, CreateDatabase>(
  async (docker, input) => {
    if (!input) {
      throw new DatabaseError({
        name: "CREATE_DATABASE_ERROR",
        message: MISSING_DATABASE_NAME_AND_IMAGE_ERROR_MESSAGE,
      });
    }
    const { databaseImage, databaseName } = input;
    const credentialsEnvVars = createDatabaseEnvVarsCredential(databaseImage);
    if (!credentialsEnvVars) {
      throw new DatabaseError({
        name: "CREATE_DATABASE_ERROR",
        message: DEFAULT_DATABASES_CREDENTIALS_ENV_VAR_NOT_FOUND_ERROR_MESSAGE,
      });
    }
    const database = await getDatabasePortAndCredsEnvVarByImage(databaseImage);
    const dbSpec = createDatabaseServiceSpec({
      database: databaseImage,
      name: databaseName,
      port: database.port,
      initialEnvCreds: database.credentialsEnvVar,
    });
    return await docker.createService(dbSpec)
      .catch((error) => {
        throw new DatabaseError({
          name: "CREATE_DATABASE_ERROR",
          message: error instanceof Error ? error.message : "Unexpected error occurred while creating the database service.",
        });
      });
  },
);

export const startDatabaseService = withDatabaseService(
  async (dbService) => {
    await dbService.update({ Spec: { Mode: { Replicated: { Replicas: DATABASE_INSTANCE_REPLICAS } } } });
  },
);

export const stopDatabaseService = withDatabaseService(
  async (dbService) => {
    await dbService.update({ Spec: { Mode: { Replicated: { Replicas: 0 } } } });
  },
);

export const removeDatabaseService = withDatabaseService(
  async (dbService) => {
    await dbService.remove();
  },
);
