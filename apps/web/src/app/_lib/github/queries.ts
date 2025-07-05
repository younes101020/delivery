import "server-only";

import { client } from "../client-http";

export async function getAllGithubAppCreds() {
  const response = await client.githubapps.$get();
  if (response.status !== 200) {
    return null;
  }
  const result = await response.json();
  return result;
}

export async function setInstallationIdOnGithubApp({ githubAppId, installationId }: { githubAppId: string; installationId: number }) {
  await client.githubapps[":id"].$patch({
    param: {
      id: githubAppId,
    },
    json: {
      installationId,
    },
  });
}
