import "server-only";

import { client } from "@/app/_lib/client-http";

export async function getDeliveryWebInstanceConfiguration() {
  const response = await client.serverconfig.instance.$get();

  if (response.status !== 200)
    return null;

  return await response.json();
}

export type DeliveryWebInstanceConfiguration = Awaited<ReturnType<typeof getDeliveryWebInstanceConfiguration>>;
