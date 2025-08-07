import "server-only";

import { client } from "@/app/_lib/client-http";

export async function getDeliveryWebInstanceConfiguration() {
  const http = await client();
  const response = await http.serverconfig["web-service"].$get();

  if (response.status !== 200)
    return null;

  return await response.json();
}

export type DeliveryWebInstanceConfiguration = Awaited<ReturnType<typeof getDeliveryWebInstanceConfiguration>>;
