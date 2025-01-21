import { client } from "../http";

export async function getDeployments() {
  const response = await client.deployments.jobs.$get();
  if (response.status !== 200) {
    return null;
  }
  return await response.json();
}
