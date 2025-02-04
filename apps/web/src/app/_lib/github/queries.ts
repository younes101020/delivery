import "server-only";
import { unstable_cacheTag as cacheTag } from "next/cache";

import { client } from "../client-http";

export async function getAllGithubAppInstallations() {
  "use cache";
  cacheTag("github-app-installations-creds");
  const response = await client.githubapps.$get();
  if (response.status !== 200) {
    return null;
  }
  const result = await response.json();
  return result;
}
