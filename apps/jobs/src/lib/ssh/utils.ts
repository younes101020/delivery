import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import env from "@/env";

export async function loadConfig() {
  const { keyPath, privateKey } = await findSSHKey();
  const username = getUserFromKeyPath(keyPath);

  return {
    host: env.SSH_HOST,
    username,
    privateKey,
  };
}

interface SSHKey {
  keyPath: string;
  privateKey: string;
}

const keyCache = new Set<SSHKey>();

async function findSSHKey() {
  const [cachedKey] = keyCache;
  if (cachedKey) {
    return cachedKey;
  }

  try {
    const isContainerized = await checkIsContainerized();
    const keyDirectory = isContainerized ? "/var/ssh/keys" : "/data/delivery/ssh/keys";
    const files = await readdir(keyDirectory);

    const keyFile = files.find(
      file => file.startsWith("id.") && file.endsWith("@host.docker.internal"),
    );

    if (!keyFile) {
      throw new Error("No matching SSH key found");
    }

    const keyPath = path.join(keyDirectory, keyFile);
    const privateKey = await readFile(keyPath, "utf-8");
    const key = { keyPath, privateKey };
    keyCache.add(key);

    return key;
  }
  catch (error: unknown) {
    if (error instanceof Error) {
      throw new TypeError(`Failed to find SSH key: ${error.message}`);
    }
    throw new Error("Failed to find SSH key: Unknown error occurred");
  }
}

function getUserFromKeyPath(keyPath: string) {
  const filename = path.basename(keyPath);
  const match = filename.match(/^id\.(.+)@host\.docker\.internal$/)!;
  return match[1];
}

export async function checkIsContainerized() {
  return existsSync("/.dockerenv");
}
