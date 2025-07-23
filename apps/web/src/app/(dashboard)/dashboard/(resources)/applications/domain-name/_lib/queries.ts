import "server-only";

import { client } from "@/app/_lib/client-http";

export async function getApplicationsDomainConfiguration() {
  const response = await client.serverconfig.$get();

  if (response.status !== 200)
    return null;

  const serverConfig = await response.json();

  return {
    wildcardDomain: serverConfig.wildcardDomain || undefined,
    publicIp: serverConfig.publicIp,
  };
}

export type ApplicationsDomainConfiguration = Awaited<ReturnType<typeof getApplicationsDomainConfiguration>>;
