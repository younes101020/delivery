import "server-only";

import { client } from "@/app/_lib/client-http";

export async function getCurrentDeploymentsState() {
  const response = await client.deployments.jobs.$get();
  if (!response.ok) {
    return null;
  }
  return await response.json();
}
