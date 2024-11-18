import fs from "fs";
import { NodeSSH } from "node-ssh";
import path from "path";
import env from "@/env";

export const getUserFromKeyPath = (keyPath: string): string => {
  const filename = path.basename(keyPath);
  const match = filename.match(/^id\.(.+)@host\.docker\.internal$/)!;
  return match[1];
};

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
        host: env.SSH_HOST,
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

export const findSSHKey = async (keyDirectory = "/var/ssh/keys") => {
  try {
    const files = await fs.promises.readdir(keyDirectory);

    const keyFile = files.find(
      (file) => file.startsWith("id.") && file.endsWith("@host.docker.internal")
    );

    if (!keyFile) {
      throw new Error("No matching SSH key found");
    }

    return path.join(keyDirectory, keyFile);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to find SSH key: ${error.message}`);
    }
    throw new Error("Failed to find SSH key: Unknown error occurred");
  }
};
