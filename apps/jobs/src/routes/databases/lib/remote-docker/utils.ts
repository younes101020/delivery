import type Dockerode from "dockerode";

import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { Database } from "@/db/dto";
import type { ServicesDto } from "@/db/dto/services.dto";

import { getDocker } from "@/lib/remote-docker";
import { withDocker, withSwarmService } from "@/lib/remote-docker/middleware";
import { toServiceSpec } from "@/lib/remote-docker/utils";
import { generateRandomString } from "@/lib/utils";

import { DATABASES_CONTAINER_NOT_FOUND_ERROR_MESSAGE, DEFAULT_DATABASES_CREDENTIALS_ENV_VAR_NOT_FOUND_ERROR_MESSAGE, NO_CONTAINER_SERVICE_ERROR_MESSAGE, UNSUPPORTED_DATABASES_ERROR_MESSAGE } from "./const";
import { getDatabasePortAndCredsEnvVarByImage, getDatabasesName } from "./queries";

export const getDbCredentialsEnvVarsAndDatabaseByServiceId = withSwarmService(async (dbService) => {
  const taskTemplate = dbService.Spec?.TaskTemplate;
  const containerSpecExist = assertTaskTemplateIsContainerTaskSpecGuard(taskTemplate);
  if (!containerSpecExist)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: NO_CONTAINER_SERVICE_ERROR_MESSAGE });

  const database = taskTemplate?.ContainerSpec?.Image;
  const databaseExist = await checkIfDatabaseExist(database);
  if (!databaseExist || !database)
    throw new HTTPException(HttpStatusCodes.BAD_REQUEST, { message: UNSUPPORTED_DATABASES_ERROR_MESSAGE });

  const databaseWithMetadata = await getDatabasePortAndCredsEnvVarByImage(database);

  const envVars = taskTemplate.ContainerSpec?.Env;
  if (!envVars || envVars.length === 0)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: DEFAULT_DATABASES_CREDENTIALS_ENV_VAR_NOT_FOUND_ERROR_MESSAGE });

  const credentialsEnvVars = getFullDatabaseServiceEnvVarsByEnvVarsKey(envVars, databaseWithMetadata.credentialsEnvVar);

  return { credentialsEnvVars, database };
},
);

function getFullDatabaseServiceEnvVarsByEnvVarsKey(databaseServiceEnvVars: string[], credentialsEnvVarKey: string[]) {
  return databaseServiceEnvVars.filter(envVar => credentialsEnvVarKey.some(key => envVar.includes(key)));
}

export function buildDatabaseUriFromEnvVars(dbCredentialsEnvVars: string[], database: string) {
  if (database === "postgres") {
    const postgresUserEnv = dbCredentialsEnvVars.find(envVar => envVar.includes("POSTGRES_USER"));
    const postgresPasswordEnv = dbCredentialsEnvVars.find(envVar => envVar.includes("POSTGRES_PASSWORD"));

    const postgresUser = postgresUserEnv?.split("=")[1];
    const postgresPassword = postgresPasswordEnv?.split("=")[1];

    return `postgres://${postgresUser}:${postgresPassword}@localhost:5432`;
  }

  if (database === "mongo") {
    const mongoUserEnv = dbCredentialsEnvVars.find(envVar => envVar.includes("MONGO_INITDB_ROOT_USERNAME"));
    const mongoPasswordEnv = dbCredentialsEnvVars.find(envVar => envVar.includes("MONGO_INITDB_ROOT_PASSWORD"));

    const mongoUser = mongoUserEnv?.split("=")[1];
    const mongoPassword = mongoPasswordEnv?.split("=")[1];

    return `mongodb://${mongoUser}:${mongoPassword}@localhost:27017`;
  }

  if (database === "redis") {
    const redisPasswordEnv = dbCredentialsEnvVars.find(envVar => envVar.includes("REDIS_PASSWORD"));
    const redisUserEnv = dbCredentialsEnvVars.find(envVar => envVar.includes("REDIS_USER"));

    const redisPassword = redisPasswordEnv?.split("=")[1];
    const redisUser = redisUserEnv?.split("=")[1];

    return `redis://${redisUser}:${redisPassword}@localhost:6379/0`;
  }
}

export async function getDatabaseEnvVarsByEnvVarKeys(containerId: string, envVarKey: string[]) {
  const docker = await getDocker();
  const containerMetadata = await docker.getContainer(containerId).inspect();

  if (!containerMetadata)
    throw new HTTPException(HttpStatusCodes.NOT_FOUND, { message: DATABASES_CONTAINER_NOT_FOUND_ERROR_MESSAGE });

  const envVars = containerMetadata.Config.Env;

  return envVars.filter(envVar => envVarKey.some(key => envVar.includes(key)));
}

export const addEnvironmentVariableToAppService = withSwarmService(
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
  const randomId = generateRandomString();
  const randomPassword = generateRandomString();

  if (databaseImage === "postgres") {
    return [`POSTGRES_USER=${randomId}`, `POSTGRES_PASSWORD=${randomPassword}`];
  }
  if (databaseImage === "mongo") {
    return [`MONGO_INITDB_ROOT_USERNAME=${randomId}`, `MONGO_INITDB_ROOT_PASSWORD=${randomPassword}`];
  }
  if (databaseImage === "redis") {
    return [`REDIS_PASSWORD=${randomPassword}`, `REDIS_USER=${randomId}`];
  }
  if (databaseImage === "mysql") {
    return [`MYSQL_ROOT_PASSWORD=${randomPassword}`, `MYSQL_USER=${randomId}`, `MYSQL_PASSWORD=${randomPassword}`];
  }
  if (databaseImage === "mariadb") {
    return [`MARIADB_ROOT_PASSWORD=${randomPassword}`];
  }
}

async function checkIfDatabaseExist(dbName?: string) {
  const dbNames = await getDatabasesName();
  return dbNames.includes(dbName!);
}

function assertTaskTemplateIsContainerTaskSpecGuard(taskTemplate?: Dockerode.ServiceSpec["TaskTemplate"]): taskTemplate is Dockerode.ContainerTaskSpec {
  const taskTemplateType = taskTemplate as Dockerode.ContainerTaskSpec;
  return taskTemplateType?.ContainerSpec !== undefined;
}

export const listDatabaseServicesSpec = withDocker<ServicesDto[], Dockerode.ServiceListOptions | undefined>(
  async (docker, opts) => {
    const inputFilters = opts && typeof opts.filters === "object" ? opts.filters : {};
    const dbServices = await docker.listServices({ filters: { label: ["resource=database"], ...inputFilters } });
    const servicesSpec = await Promise.all(dbServices.map(toServiceSpec));
    return servicesSpec;
  },
);
