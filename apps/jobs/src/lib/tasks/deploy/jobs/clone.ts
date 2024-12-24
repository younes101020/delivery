import { createAppAuth } from "@octokit/auth-app";
import { Buffer } from "node:buffer";
import { basename } from "node:path";

import { APPLICATIONS_PATH } from "@/lib/constants";
import sshClient from "@/lib/ssh";
import { decryptSecret } from "@/lib/utils";

import type { JobFn } from "../../types";

export interface CloneReturnType {
  repoName: string;
}

export const clone: JobFn<"clone", CloneReturnType> = async ({ data }) => {
  const { secret, appId, clientId, clientSecret, installationId, repoUrl } = data;

  const privateKey = await decryptSecret({
    encryptedData: Buffer.from(secret.encryptedData, "base64"),
    iv: Buffer.from(secret.iv, "base64"),
    key: await crypto.subtle.importKey("raw", Buffer.from(secret.key, "base64"), "AES-GCM", true, [
      "decrypt",
    ]),
  });

  const auth = createAppAuth({
    appId,
    privateKey,
    clientId,
    clientSecret,
  });

  const installationAuthentication = await auth({
    type: "installation",
    installationId,
  });

  const formattedRepoUrl = repoUrl.replace(
    "git://",
    `https://x-access-token:${installationAuthentication.token}@`,
  );

  const ssh = await sshClient();
  await ssh.execCommand(`git clone ${formattedRepoUrl}`, { cwd: APPLICATIONS_PATH });
  const repoName = basename(repoUrl, ".git");
  return { repoName };
};
