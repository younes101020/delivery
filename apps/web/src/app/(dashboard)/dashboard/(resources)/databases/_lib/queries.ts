import "server-only";

import { client } from "@/app/_lib/client-http";

export async function getDatabaseContainers() {
  const response = await client.databases.$get();
  if (response.status !== 200) {
    console.log(`Error: Received status code ${response.status}`);
    return null;
  }
  return await response.json();
}
