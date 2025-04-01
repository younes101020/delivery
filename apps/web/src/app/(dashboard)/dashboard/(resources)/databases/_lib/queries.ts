import "server-only";

import { client } from "@/app/_lib/client-http";

export async function getDatabaseService() {
  const response = await client.databases.$get();
  if (response.status !== 200) {
    return null;
  }
  return await response.json();
}
