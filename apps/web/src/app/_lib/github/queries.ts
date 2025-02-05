import "server-only";
import { unstable_cacheTag as cacheTag } from "next/cache";

import { client } from "../client-http";

export async function getAllGithubApp() {
  "use cache";
  cacheTag("github-app-installations-creds");
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
