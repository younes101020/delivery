import { SSHClient } from "./client";

const sshClient = async () => {
  const ssh = new SSHClient();
  await ssh.init();
  return await ssh.connect();
};

export default sshClient;
