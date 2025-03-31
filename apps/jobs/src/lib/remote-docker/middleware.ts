import type Dockerode from "dockerode";

import { getDocker } from ".";

export function withDocker<T, K>(fn: (docker: Dockerode, args?: K) => Promise<T>) {
  return async (args?: K) => {
    const docker = await getDocker();
    return fn(docker, args);
  };
}
