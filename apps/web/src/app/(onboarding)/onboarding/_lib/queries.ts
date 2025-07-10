import "server-only";

import { client } from "@/app/_lib/client-http";

export async function getServerConfiguration() {
  const response = await client.serverconfig.$get();
  if (response.status !== 200) {
    return null;
  }
  const result = await response.json();
  return result;
}
