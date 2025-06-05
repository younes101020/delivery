import "server-only";

import { getProtectedClient, getWebhookClient } from "../client-http";

export async function getAllGithubAppCreds() {
  const client = await getProtectedClient();
  const response = await client.githubapps.$get();
  if (response.status !== 200) {
    return null;
  }
  const result = await response.json();
  return result;
}

export async function setInstallationIdOnGithubApp({ githubAppId, installationId }: { githubAppId: string; installationId: number }) {
  const client = getWebhookClient();
  await client.githubapps[":id"].$patch({
    param: {
      id: githubAppId,
    },
    json: {
      installationId,
    },
  });
}
