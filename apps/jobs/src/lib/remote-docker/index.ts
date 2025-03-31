import Docker from "dockerode";

import { loadConfig } from "@/lib/ssh/utils";

import type { Resources } from "../constants";

import { withDocker } from "./middleware";

export async function getDocker() {
  const sshConfig = await loadConfig();
  return new Docker({ protocol: "ssh", username: sshConfig.username, sshOptions: sshConfig });
}

export const getDockerResourceEvents = withDocker<NodeJS.ReadableStream, Resources>(
  async (docker, resource) => {
    return docker.getEvents({ filters: { label: [`resource=${resource}`], type: ["container"] } });
  },
);
