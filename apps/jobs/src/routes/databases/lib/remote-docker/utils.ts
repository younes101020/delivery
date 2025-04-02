import type Dockerode from "dockerode";

import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { Database } from "@/db/dto";
import type { ServicesDto } from "@/db/dto/services.dto";

import { getDocker } from "@/lib/remote-docker";
import { withDocker, withSwarmService } from "@/lib/remote-docker/middleware";
import { toServiceSpec } from "@/lib/remote-docker/utils";
import { generateRandomString } from "@/lib/utils";
import { withRestApplicationService } from "@/routes/applications/lib/remote-docker/service-middleware";

import { DATABASES_CONTAINER_NOT_FOUND_ERROR_MESSAGE, databasesName, DEFAULT_DATABASES_CREDENTIALS_ENV_VAR_NOT_FOUND_ERROR_MESSAGE, NO_CONTAINER_SERVICE_ERROR_MESSAGE, UNSUPPORTED_DATABASES_ERROR_MESSAGE } from "./const";
import { getDatabasePortAndCredsEnvVarByImage } from "./queries";

export const getDatabaseCredentialsEnvVarsByName = withSwarmService(
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
    throw new HTTPException(HttpStatusCodes.NOT_FOUND, { message: DATABASES_CONTAINER_NOT_FOUND_ERROR_MESSAGE });

  const envVars = containerMetadata.Config.Env;

  return envVars.filter(envVar => envVarKey.some(key => envVar.includes(key)));
}

export const addEnvironmentVariableToAppService = withRestApplicationService<string, void>(
  async (appService, plainEnv) => {
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
  },
);

export function createDatabaseEnvVarsCredential(databaseImage: Database) {
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

export const listDatabaseServicesSpec = withDocker<ServicesDto[], Dockerode.ServiceListOptions | undefined>(
  async (docker, opts) => {
    const inputFilters = opts && typeof opts.filters === "object" ? opts.filters : {};
    const dbServices = await docker.listServices({ filters: { label: ["resource=database"], ...inputFilters } });
    return dbServices.map(toServiceSpec);
  },
);
