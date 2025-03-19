import Docker from "dockerode";

import { loadConfig } from "@/lib/ssh/utils";

import type { Resources } from "../constants";

export async function getDocker() {
  const sshConfig = await loadConfig();
  return new Docker({ protocol: "ssh", username: sshConfig.username, sshOptions: sshConfig });
}

export async function getDockerResourceEvents(resource: Resources) {
  const docker = await getDocker();
  return docker.getEvents({ filters: { label: [`resource=${resource}`], type: ["container"] } });
}
