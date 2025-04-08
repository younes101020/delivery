import type Dockerode from "dockerode";

import type { Database } from "@/db/dto";

import { withDocker, withSwarmService } from "@/lib/remote-docker/middleware";

import { DATABASE_INSTANCE_REPLICAS, DEFAULT_DATABASES_CREDENTIALS_ENV_VAR_NOT_FOUND_ERROR_MESSAGE, MISSING_DATABASE_NAME_AND_IMAGE_ERROR_MESSAGE } from "./const";
import { createDatabaseServiceSpec } from "./manifest";
import { getDatabasePortAndCredsEnvVarByImage } from "./queries";
import { createDatabaseEnvVarsCredential } from "./utils";

interface CreateDatabase {
  databaseImage: Database;
  databaseName: string;
}

export const createDatabaseService = withDocker<Error | Dockerode.Service, CreateDatabase>(
  async (docker, input) => {
    if (!input) {
      throw new Error(MISSING_DATABASE_NAME_AND_IMAGE_ERROR_MESSAGE);
    }
    const { databaseImage, databaseName } = input;
    const credentialsEnvVars = createDatabaseEnvVarsCredential(databaseImage);
    if (!credentialsEnvVars) {
      throw new Error(DEFAULT_DATABASES_CREDENTIALS_ENV_VAR_NOT_FOUND_ERROR_MESSAGE);
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
        throw new Error(error instanceof Error ? error.message : "Unexpected error occurred while creating the database service.");
      });
  },
);

export const startDatabaseService = withSwarmService(
  async (dbService) => {
    const currentServiceSpec = await dbService.inspect();
    currentServiceSpec.Spec.Mode.Replicated.Replicas = DATABASE_INSTANCE_REPLICAS;
    await dbService.update({
      ...currentServiceSpec.Spec,
      version: Number.parseInt(currentServiceSpec.Version.Index),
    });
  },
);

export const stopDatabaseService = withSwarmService(
  async (dbService) => {
    const currentServiceSpec = await dbService.inspect();
    currentServiceSpec.Spec.Mode.Replicated.Replicas = 0;
    await dbService.update({
      ...currentServiceSpec.Spec,
      version: Number.parseInt(currentServiceSpec.Version.Index),
    },
    );
  },
);

export const removeDatabaseService = withSwarmService(
  async (dbService) => {
    await dbService.remove();
  },
);
