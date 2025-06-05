import "server-only";

import { getProtectedClient } from "@/app/_lib/client-http";

export async function getServerConfiguration() {
  const client = await getProtectedClient();
  const response = await client.serverconfig.$get();
  if (response.status !== 200) {
    return null;
  }
  const result = await response.json();
  return result;
}
