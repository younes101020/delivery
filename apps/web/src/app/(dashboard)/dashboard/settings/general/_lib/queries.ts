import "server-only";
import { unstable_cacheTag as cacheTag } from "next/cache";

import { client } from "@/app/_lib/client-http";

export async function getDeliveryWebInstanceConfiguration() {
  "use cache";
  cacheTag("delivery-instance-configuration");
  const response = await client.serverconfig.instance.$get();

  if (response.status !== 200)
    return null;

  return await response.json();
}
