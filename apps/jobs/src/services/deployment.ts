import { SSHClient } from "../lib/ssh/client";

export const startDeployment = async () => {
  const ssh = new SSHClient();
  await ssh.connect();
};
