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

      await this.ssh.connect({
        host: "localhost",
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