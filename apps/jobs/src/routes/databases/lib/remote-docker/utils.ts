import Docker from "dockerode";
import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { DatabaseSchema } from "@/db/dto/databases.dto";

import { loadConfig } from "@/lib/ssh/utils";

const sshConfig = await loadConfig();
export const docker = new Docker({ protocol: "ssh", username: sshConfig.username, sshOptions: sshConfig });

export async function getDatabasesContainers() {
  const dbContainers = await docker.listContainers({ all: true });
  return dbContainers.map(({ Image, Id, State, Created }) => ({
    name: Image.split(":")[0],
    id: Id,
    state: State as DatabaseSchema["state"],
    createdAt: Created,
    isProcessing: false,
  }));
}

export async function stopDatabaseContainer(containerId: string) {
  const container = docker.getContainer(containerId);
  await container.stop();
}

export async function startDatabaseContainer(containerId: string) {
  const container = docker.getContainer(containerId);
  await container.start();
}

export async function getDatabaseEnvVarsByEnvVarKeys(containerId: string, envVarKey: string[]) {
  const containerMetadata = await docker.getContainer(containerId).inspect();

  if (!containerMetadata)
    throw new HTTPException(HttpStatusCodes.NOT_FOUND, { message: "Database container not found" });

  const envVars = containerMetadata.Config.Env;

  return envVars.filter(envVar => envVarKey.some(key => envVar.includes(key)));
}
