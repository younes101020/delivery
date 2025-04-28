import { createAppAuth } from "@octokit/auth-app";
import { Buffer } from "node:buffer";

import { APPLICATIONS_PATH } from "@/lib/constants";
import { DeploymentError } from "@/lib/error";
import { ssh } from "@/lib/ssh";
import { decryptSecret } from "@/lib/utils";
import { convertGitToAuthenticatedUrl } from "@/routes/deployments/lib/tasks/deploy/utils";

import type { QueueDeploymentJob } from "../types";

export async function clone(job: QueueDeploymentJob<"clone">) {
  const { secret, appId, clientId, clientSecret, installationId, repoUrl, repoName } = job.data;
  await job.updateProgress({ logs: "Github repository will be fetched...\n" });

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

  const authenticatedUrl = convertGitToAuthenticatedUrl(repoUrl, installationAuthentication.token);

  await ssh(`git clone ${authenticatedUrl} ${repoName}`, {
    cwd: APPLICATIONS_PATH,
    onStdout: async ({ chunk, chunks, isCriticalError }) => {
      await Promise.all([
        job.updateProgress({ logs: chunk, isCriticalError, jobId: job.id }),
        job.updateData({ ...job.data, logs: chunks?.join(), isCriticalError }),
      ]);
    },
  }).catch((error) => {
    throw new DeploymentError({
      name: "CLONE_APP_ERROR",
      message: error instanceof Error ? error.message : "Unexpected error",
    });
  });
}
