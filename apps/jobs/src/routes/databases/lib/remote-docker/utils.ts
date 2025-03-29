import type Dockerode from "dockerode";

import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { Database } from "@/db/dto";

import { getDocker } from "@/lib/remote-docker";
import { generateRandomString } from "@/lib/utils";
import { getApplicationService } from "@/routes/applications/lib/remote-docker/utils";

import { credentialsEnvKeys, databases, DATABASES_CONTAINER_NOT_FOUND_ERROR_MESSAGE, DEFAULT_DATABASES_CREDENTIALS_ENV_VAR_NOT_FOUND_ERROR_MESSAGE, NO_APPLICATION_TO_LINK_WITH_ERROR_MESSAGE, NO_CONTAINER_SERVICE_ERROR_MESSAGE, UNSUPPORTED_DATABASES_ERROR_MESSAGE } from "./const";
import { withRestDatabaseService } from "./middleware";

export const getDatabaseCredentialsEnvVarsByName = withRestDatabaseService(
  async (dbService) => {
    const dbName = dbService.Spec?.Name;
    const databaseExist = assertNameIsDatabaseNameGuard(dbName);
    if (!databaseExist)
      throw new Error(UNSUPPORTED_DATABASES_ERROR_MESSAGE);

    const envVarKeys = credentialsEnvKeys.postgres;
    const taskTemplate = dbService.Spec?.TaskTemplate;
    const containerSpecExist = assertTaskTemplateIsContainerTaskSpecGuard(taskTemplate);
    if (!containerSpecExist)
      throw new Error(NO_CONTAINER_SERVICE_ERROR_MESSAGE);

    const envVars = taskTemplate.ContainerSpec?.Env;
    if (!envVars || envVars.length === 0)
      throw new Error(DEFAULT_DATABASES_CREDENTIALS_ENV_VAR_NOT_FOUND_ERROR_MESSAGE);

    return envVars.filter(envVar => envVarKeys.some(key => envVar.includes(key)));
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

function assertNameIsDatabaseNameGuard(dbName?: string): dbName is Database {
  return databases.includes(dbName!);
}

function assertTaskTemplateIsContainerTaskSpecGuard(taskTemplate?: Dockerode.ServiceSpec["TaskTemplate"]): taskTemplate is Dockerode.ContainerTaskSpec {
  const taskTemplateType = taskTemplate as Dockerode.ContainerTaskSpec;
  return taskTemplateType?.ContainerSpec !== undefined;
}
