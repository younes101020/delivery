import type Dockerode from "dockerode";

import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";

import { getDocker } from "@/lib/remote-docker";
import { withDocker } from "@/lib/remote-docker/middleware";
import { toServiceSpec } from "@/lib/remote-docker/utils";
import { generateRandomString } from "@/lib/utils";

import type { Database, DatabaseService } from "../dto";

import { DATABASES_CONTAINER_NOT_FOUND_ERROR_MESSAGE } from "./const";

export function getEnvironmentVariablesByKeys(databaseServiceEnvVars: string[], credentialsEnvVarKey: string[]) {
  return databaseServiceEnvVars.filter(envVar => credentialsEnvVarKey.some(key => envVar.includes(key)));
}

type DatabaseCredentialsEnvVars = string[];
interface DatabaseUriBuilderMap {
  buildUri: (dbCredentialsEnvVars: DatabaseCredentialsEnvVars, dbServiceName: string) => string;
}

export const databaseUriBuilderMap = new Map<string, DatabaseUriBuilderMap>([
  ["postgres", {
    buildUri: (dbCredentialsEnvVars, dbServiceName) => {
      const postgresUserEnv = dbCredentialsEnvVars.find(envVar => envVar.includes("POSTGRES_USER"));
      const postgresPasswordEnv = dbCredentialsEnvVars.find(envVar => envVar.includes("POSTGRES_PASSWORD"));

      const postgresUser = postgresUserEnv?.split("=")[1];
      const postgresPassword = postgresPasswordEnv?.split("=")[1];

      return `postgres://${postgresUser}:${postgresPassword}@${dbServiceName}:5432`;
    },
  }],
  ["mongo", {
    buildUri: (dbCredentialsEnvVars, dbServiceName) => {
      const mongoUserEnv = dbCredentialsEnvVars.find(envVar => envVar.includes("MONGO_INITDB_ROOT_USERNAME"));
      const mongoPasswordEnv = dbCredentialsEnvVars.find(envVar => envVar.includes("MONGO_INITDB_ROOT_PASSWORD"));

      const mongoUser = mongoUserEnv?.split("=")[1];
      const mongoPassword = mongoPasswordEnv?.split("=")[1];

      return `mongodb://${mongoUser}:${mongoPassword}@${dbServiceName}:27017`;
    },
  }],
  ["redis", {
    buildUri: (dbCredentialsEnvVars, dbServiceName) => {
      const redisPasswordEnv = dbCredentialsEnvVars.find(envVar => envVar.includes("REDIS_PASSWORD"));
      const redisUserEnv = dbCredentialsEnvVars.find(envVar => envVar.includes("REDIS_USER"));

      const redisPassword = redisPasswordEnv?.split("=")[1];
      const redisUser = redisUserEnv?.split("=")[1];

      return `redis://${redisUser}:${redisPassword}@${dbServiceName}:6379/0`;
    },
  }],
]);

export async function getDatabaseEnvVarsByEnvVarKeys(containerId: string, envVarKey: string[]) {
  const docker = await getDocker();
  const containerMetadata = await docker.getContainer(containerId).inspect();

  if (!containerMetadata)
    throw new HTTPException(HttpStatusCodes.NOT_FOUND, { message: DATABASES_CONTAINER_NOT_FOUND_ERROR_MESSAGE });

  const envVars = containerMetadata.Config.Env;

  return envVars.filter(envVar => envVarKey.some(key => envVar.includes(key)));
}

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

export const listDatabaseServicesSpec = withDocker<DatabaseService[], Dockerode.ServiceListOptions | undefined>(
  async (docker, opts) => {
    const inputFilters = opts && typeof opts.filters === "object" ? opts.filters : {};
    const dbServices = await docker.listServices({ filters: { label: ["resource=database"], ...inputFilters } });
    const servicesSpec = await Promise.all(dbServices.map(toServiceSpec));
    return servicesSpec;
  },
);
