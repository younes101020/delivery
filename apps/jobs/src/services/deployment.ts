import { SSHClient } from "../lib/ssh/client.js";

const sshClient = async () => {
  const ssh = new SSHClient();
  await ssh.init();
  return await ssh.connect();
};

export const startDeployment = async (appName: string) => {
  const ssh = await sshClient();
  const result = await ssh.execCommand(
    `nixpacks build ./ --name ${appName} -o /data/delivery/applications/${appName}`
  );
  return {
    stdout: result.stdout,
    stderr: result.stderr,
  };
};
