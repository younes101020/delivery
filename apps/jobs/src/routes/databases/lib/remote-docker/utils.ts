import Docker from "dockerode";

import type { DatabaseSchema } from "@/db/dto/databases.dto";

import { loadConfig } from "@/lib/ssh/utils";

const sshConfig = await loadConfig();
export const docker = new Docker({ protocol: "ssh", username: sshConfig.username, sshOptions: sshConfig });

export async function getDatabasesContainers() {
  const dbContainers = await docker.listContainers({ all: true });
  return dbContainers.map(({ Image, Id, State, Status, Created }) => ({
    name: Image.split(":")[0],
    id: Id,
    status: Status,
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
