import type Dockerode from "dockerode";

import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { Database } from "@/db/dto";

import { getDocker } from "@/lib/remote-docker";
import { generateRandomString } from "@/lib/utils";
import { getApplicationService } from "@/routes/applications/lib/remote-docker/utils";

import { databases, DATABASES_CONTAINER_NOT_FOUND_ERROR_MESSAGE, databasesName, DEFAULT_DATABASES_CREDENTIALS_ENV_VAR_NOT_FOUND_ERROR_MESSAGE, NO_APPLICATION_TO_LINK_WITH_ERROR_MESSAGE, NO_CONTAINER_SERVICE_ERROR_MESSAGE, UNSUPPORTED_DATABASES_ERROR_MESSAGE } from "./const";
import { getDatabasePortAndCredsEnvVarByImage } from "./queries";
import { withRestDatabaseService } from "./service-middleware";

export const getDatabaseCredentialsEnvVarsByName = withRestDatabaseService(
  async (dbService) => {
    const dbName = dbService.Spec?.Name;
    const databaseExist = assertNameIsDatabaseNameGuard(dbName);
    if (!databaseExist)
      throw new Error(UNSUPPORTED_DATABASES_ERROR_MESSAGE);

    const database = await getDatabasePortAndCredsEnvVarByImage(dbName);
    const taskTemplate = dbService.Spec?.TaskTemplate;
    const containerSpecExist = assertTaskTemplateIsContainerTaskSpecGuard(taskTemplate);
    if (!containerSpecExist)
      throw new Error(NO_CONTAINER_SERVICE_ERROR_MESSAGE);

    const envVars = taskTemplate.ContainerSpec?.Env;
    if (!envVars || envVars.length === 0)
      throw new Error(DEFAULT_DATABASES_CREDENTIALS_ENV_VAR_NOT_FOUND_ERROR_MESSAGE);

    return envVars.filter(envVar => database.credentialsEnvVar.some(key => envVar.includes(key)));
  },
);

export async function getDatabaseEnvVarsByEnvVarKeys(containerId: string, envVarKey: string[]) {
  const docker = await getDocker();
  const containerMetadata = await docker.getContainer(containerId).inspect();

  if (!containerMetadata)
    throw new HTTPException(HttpStatusCodes.NOT_FOUND, { message: "Database container not found" });

  const envVars = containerMetadata.Config.Env;

  return envVars.filter(envVar => envVarKey.some(key => envVar.includes(key)));
}

export async function addEnvironmentVariableToAppService(applicationName: string, plainEnv: string) {
  const appService = await getApplicationService({ name: [applicationName] });
  if (!appService)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: NO_APPLICATION_TO_LINK_WITH_ERROR_MESSAGE });

  const container = appService.Spec?.TaskTemplate as Dockerode.ContainerTaskSpec;
  const currentEnvs = typeof container.ContainerSpec?.Env === "object" ? container.ContainerSpec.Env : [];

  await appService.update({
    ...appService.Spec,
    TaskTemplate: {
      ...appService.Spec?.TaskTemplate,
      ContainerSpec: {
        ...container.ContainerSpec,
        Env: [
          ...currentEnvs,
          plainEnv,
        ],
      },
    },
  });
}

export function getDatabaseEnvVarsCredential(databaseImage: Database) {
  if (databaseImage === "postgres") {
    const DB_USER = generateRandomString();
    const DB_PASSWORD = generateRandomString();
    return [`POSTGRES_USER=${DB_USER}`, `POSTGRES_PASSWORD=${DB_PASSWORD}`];
  }
  if (databaseImage === "mongo") {
    const DB_USER = generateRandomString();
    const DB_PASSWORD = generateRandomString();
    return [`MONGO_INITDB_ROOT_USERNAME=${DB_USER}`, `MONGO_INITDB_ROOT_PASSWORD=${DB_PASSWORD}`];
  }
  if (databaseImage === "redis") {
    const DB_PASSWORD = generateRandomString();
    return [`REDIS_PASSWORD=${DB_PASSWORD}`];
  }
  if (databaseImage === "mysql") {
    const DB_USER = generateRandomString();
    const DB_PASSWORD = generateRandomString();
    return [`MYSQL_ROOT_PASSWORD=${DB_PASSWORD}`, `MYSQL_USER=${DB_USER}`, `MYSQL_PASSWORD=${DB_PASSWORD}`];
  }
  if (databaseImage === "mariadb") {
    const DB_PASSWORD = generateRandomString();
    return [`MARIADB_ROOT_PASSWORD=${DB_PASSWORD}`];
  }
}

function assertNameIsDatabaseNameGuard(dbName?: string): dbName is Database {
  return databasesName.includes(dbName!);
}

function assertTaskTemplateIsContainerTaskSpecGuard(taskTemplate?: Dockerode.ServiceSpec["TaskTemplate"]): taskTemplate is Dockerode.ContainerTaskSpec {
  const taskTemplateType = taskTemplate as Dockerode.ContainerTaskSpec;
  return taskTemplateType?.ContainerSpec !== undefined;
}
