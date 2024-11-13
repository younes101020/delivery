import { SSHClient } from "../lib/ssh/client.js";

const sshClient = async () => {
  const ssh = new SSHClient();
  await ssh.init();
  return await ssh.connect();
};

export const startDeployment = async () => {
  const ssh = await sshClient();
  const result = await ssh.execCommand("ls -la");
  return {
    stdout: result.stdout,
    stderr: result.stderr,
  };
};
