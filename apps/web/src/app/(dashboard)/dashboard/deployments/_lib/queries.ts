import "server-only";

import { client } from "@/app/_lib/client-http";

export async function getDeployments() {
  const response = await client.deployments.jobs.$get();
  if (response.status !== 200) {
    return null;
  }
  return await response.json();
}
