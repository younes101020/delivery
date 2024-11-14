import fs from "fs";
import path from "path";

export const findSSHKey = async (keyDirectory = "./var/ssh/keys") => {
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

export const getUserFromKeyPath = (keyPath: string): string => {
  const filename = path.basename(keyPath);
  const match = filename.match(/^id\.(.+)@host\.docker\.internal$/)!;
  return match[1];
};
