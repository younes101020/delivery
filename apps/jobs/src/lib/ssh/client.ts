import { NodeSSH } from "node-ssh";
import { findSSHKey, getUserFromKeyPath } from "./utils.js";

export class SSHClient {
  private ssh: NodeSSH;
  private user: string | null = null;
  private privateKeyPath: string | null = null;

  constructor() {
    this.ssh = new NodeSSH();
  }

  async init() {
    const privateKeyPath = await findSSHKey();

    this.user = getUserFromKeyPath(privateKeyPath);
    this.privateKeyPath = privateKeyPath;
  }

  async connect() {
    try {
      if (!this.privateKeyPath) {
        throw new Error("Private key path is not set");
      }

      if (!this.user) {
        throw new Error("User is not set");
      }
      // On WSL2, the host is the IP address of the WSL2 VM otherwise it's host.docker.internal
      // TODO: Find a better way to determine the host
      await this.ssh.connect({
        host: "172.20.123.35",
        username: this.user,
        privateKeyPath: this.privateKeyPath,
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
