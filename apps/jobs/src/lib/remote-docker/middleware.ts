import type Dockerode from "dockerode";

import { getDocker } from ".";
import { getSwarmServiceById } from "./utils";

export function withDocker<T, K>(fn: (docker: Dockerode, args?: K) => Promise<T>) {
  return async (args?: K) => {
    const docker = await getDocker();
    return fn(docker, args);
  };
}

export function withSwarmService<T>(
  cb: (dbServices: Dockerode.Service) => Promise<T>,
) {
  return async (databaseServiceId: string) => {
    const swarmService = await getSwarmServiceById(databaseServiceId);
    return cb(swarmService);
  };
}
