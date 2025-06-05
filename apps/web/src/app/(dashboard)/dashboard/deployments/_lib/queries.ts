import "server-only";

import { getProtectedClient } from "@/app/_lib/client-http";

export async function getCurrentDeploymentsState() {
  const client = await getProtectedClient();
  const response = await client.deployments.jobs.ongoing.$get();
  if (!response.ok) {
    return [];
  }
  return await response.json();
}

export async function getPreviousDeploymentsState() {
  const client = await getProtectedClient();
  const response = await client.deployments.jobs.previous.$get();
  if (!response.ok) {
    return [];
  }
  return await response.json();
}

export type OngoingDeployments = Awaited<ReturnType<typeof getCurrentDeploymentsState>>;
export type PreviousDeployments = Awaited<ReturnType<typeof getPreviousDeploymentsState>>;
