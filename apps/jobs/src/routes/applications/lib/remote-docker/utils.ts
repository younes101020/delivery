import type { ContainersDto } from "@/db/dto/containers.dto";

import { getDocker } from "@/lib/remote-docker";

export async function getApplicationsContainers(filters: { [key: string]: string[] } = {}) {
  const docker = await getDocker();
  const appContainers = await docker.listContainers({
    all: true,
    filters: { ...filters, label: ["resource=application"] },
  });
  return appContainers.map(({ Names, Id, State, Created }) => ({
    name: Names[0].replace("/", ""),
    id: Id,
    state: (State === "exited" || State === "die" ? "stop" : State) as ContainersDto["state"],
    createdAt: Created,
    isProcessing: false,
  }));
}
