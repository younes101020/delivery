import "server-only";

import { client } from "@/app/_lib/client-http";

export async function getServerConfiguration() {
  const http = await client();
  const response = await http.serverconfig.$get();
  if (response.status !== 200) {
    return null;
  }
  const result = await response.json();
  return result;
}
