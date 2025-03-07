import Docker from "dockerode";

import { loadConfig } from "@/lib/ssh/utils";

const sshConfig = await loadConfig();
export const docker = new Docker({ protocol: "ssh", username: sshConfig.username, sshOptions: sshConfig });
