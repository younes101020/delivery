import "server-only";

import { client } from "@/app/_lib/client-http";

export async function getDatabaseService() {
  const response = await client.databases.$get();
  if (response.status !== 200) {
    return null;
  }
  return await response.json();
}

export async function getActiveDatabaseServices() {
  const response = await client.databases.$get();
  if (response.status !== 200) {
    return null;
  }
  const data = await response.json();
  return data.filter(service => service.isActive);
}

export type Databases = Awaited<ReturnType<typeof getDatabaseService>>;
