import type { ContainersDto } from "@/db/dto/containers.dto";

import { getDocker } from "@/lib/remote-docker";

export async function getApplicationsContainers() {
  const docker = await getDocker();
  const appContainers = await docker.listContainers({
    all: true,
    filters: { label: ["resource=application"] },
  });
  return appContainers.map(({ Image, Id, State, Created }) => ({
    name: Image,
    id: Id,
    state: (State === "exited" || State === "die" ? "stop" : State) as ContainersDto["state"],
    createdAt: Created,
    isProcessing: false,
  }));
}
