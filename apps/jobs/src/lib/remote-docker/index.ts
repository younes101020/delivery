import Docker from "dockerode";

import type { Resources } from "../constants";

import { withDocker } from "./middleware";

export async function getDocker() {
  return new Docker();
}

export const getDockerResourceEvents = withDocker<NodeJS.ReadableStream, Resources>(
  async (docker, resource) => {
    return docker.getEvents({ filters: { label: [`resource=${resource}`], type: ["service"] } });
  },
);
