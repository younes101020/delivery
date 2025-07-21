import "server-only";

import { client } from "@/app/_lib/client-http";

type GetApplicationByNameParams = Promise<{ name: string }>;

export async function getApplicationByName(params: GetApplicationByNameParams) {
  const { name } = await params;

  const response = await client.applications[":name"].$get({
    param: {
      name,
    },
  });
  if (response.status !== 200) {
    return null;
  }
  return await response.json();
}

export async function getApplications() {
  const response = await client.applications.$get();
  if (response.status !== 200) {
    return null;
  }
  return await response.json();
}

export type Application = Awaited<ReturnType<typeof getApplicationByName>>;
