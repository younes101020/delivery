import type Dockerode from "dockerode";

import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { ContainersDto } from "@/db/dto/services.dto";

import { getDocker } from "@/lib/remote-docker";
import { getApplicationServiceByName } from "@/lib/remote-docker/utils";

export async function getDatabasesContainers() {
  const docker = await getDocker();
  const dbContainers = await docker.listContainers({
    all: true,
    filters: { label: ["resource=database"] },
  });
  return dbContainers.map(({ Image, Id, State, Created, Names }) => ({
    image: Image.split(":")[0],
    name: Names.map(name => name.slice(1)).join(", "),
    id: Id,
    state: (State === "exited" || State === "die" ? "stop" : State) as ContainersDto["state"],
    createdAt: Created,
    isProcessing: false,
  }));
}

export async function getDatabaseEnvVarsByEnvVarKeys(containerId: string, envVarKey: string[]) {
  const docker = await getDocker();
  const containerMetadata = await docker.getContainer(containerId).inspect();

  if (!containerMetadata)
    throw new HTTPException(HttpStatusCodes.NOT_FOUND, { message: "Database container not found" });

  const envVars = containerMetadata.Config.Env;

  return envVars.filter(envVar => envVarKey.some(key => envVar.includes(key)));
}

export async function addEnvironmentVariableToAppService(applicationName: string, plainEnv: string) {
  const appService = await getApplicationServiceByName({ applicationName });
  if (!appService)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: "Application target service not found" });

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
