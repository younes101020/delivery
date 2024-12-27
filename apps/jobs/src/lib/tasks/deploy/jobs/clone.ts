import { createAppAuth } from "@octokit/auth-app";
import { Buffer } from "node:buffer";
import { basename } from "node:path";

import { APPLICATIONS_PATH } from "@/lib/constants";
import sshClient from "@/lib/ssh";
import { decryptSecret } from "@/lib/utils";

import type { JobFn } from "../../types";

export const clone: JobFn<"clone"> = async (job) => {
  job.updateProgress(0);
  const { secret, appId, clientId, clientSecret, installationId, repoUrl } = job.data;

  const privateKey = await decryptSecret({
    encryptedData: Buffer.from(secret.encryptedData, "base64"),
    iv: Buffer.from(secret.iv, "base64"),
    key: await crypto.subtle.importKey("raw", Buffer.from(secret.key, "base64"), "AES-GCM", true, [
      "decrypt",
    ]),
  });

  job.updateProgress(25);

  const auth = createAppAuth({
    appId,
    privateKey,
    clientId,
    clientSecret,
  });

  job.updateProgress(50);

  const installationAuthentication = await auth({
    type: "installation",
    installationId,
  });

  const formattedRepoUrl = repoUrl.replace(
    "git://",
    `https://x-access-token:${installationAuthentication.token}@`,
  );

  job.updateProgress(75);

  const ssh = await sshClient();
  await ssh.execCommand(`git clone ${formattedRepoUrl}`, {
    cwd: APPLICATIONS_PATH,
  });

  const repoName = basename(repoUrl, ".git");

  job.updateProgress(100);

  return { repoName };
};
