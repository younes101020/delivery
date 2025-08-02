import "server-only";

import { client } from "../client-http";

export async function getDeliveryVersionInfo() {
  const response = await client.version.$get();
  if (response.status !== 200) {
    return null;
  }
  return await response.json();
}

export type DeliveryVersion = Awaited<ReturnType<typeof getDeliveryVersionInfo>>;
