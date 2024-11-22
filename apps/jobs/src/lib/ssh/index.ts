import { SSHClient } from "./client";

async function sshClient() {
  const ssh = new SSHClient();
  await ssh.init();
  return await ssh.connect();
};

export default sshClient;
