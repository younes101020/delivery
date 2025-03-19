import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { ContainersDto } from "@/db/dto/containers.dto";

import { getDocker } from "@/lib/remote-docker";

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
