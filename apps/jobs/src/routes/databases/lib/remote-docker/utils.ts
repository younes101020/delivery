import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { ContainersDto } from "@/db/dto/containers.dto";

import { docker } from "@/lib/remote-docker";

export async function getDatabasesContainers() {
  const dbContainers = await docker.listContainers({
    all: true,
    filters: { label: ["resource=database"] },
  });
  return dbContainers.map(({ Image, Id, State, Created }) => ({
    name: Image.split(":")[0],
    id: Id,
    state: State as ContainersDto["state"],
    createdAt: Created,
    isProcessing: false,
  }));
}

export async function getDatabaseEnvVarsByEnvVarKeys(containerId: string, envVarKey: string[]) {
  const containerMetadata = await docker.getContainer(containerId).inspect();

  if (!containerMetadata)
    throw new HTTPException(HttpStatusCodes.NOT_FOUND, { message: "Database container not found" });

  const envVars = containerMetadata.Config.Env;

  return envVars.filter(envVar => envVarKey.some(key => envVar.includes(key)));
}
