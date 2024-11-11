import { NodeSSH } from "node-ssh";
import { findSSHKey } from "./utils";

export class SSHClient {
  private ssh: NodeSSH;

  constructor() {
    this.ssh = new NodeSSH();
  }

  async connect() {
    try {
      const privateKeyPath = await findSSHKey();

      await this.ssh.connect({
        host: "host.docker.internal",
        privateKeyPath,
      });

      return this.ssh;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`SSH connection failed: ${error.message}`);
      }
      throw new Error("SSH connection failed: Unknown error occurred");
    }
  }
}
