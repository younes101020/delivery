import { hcWithType } from "@delivery/jobs/hc";

import { env } from "@/env";

import { getUser } from "./user-session";

export function getClient() {
  return hcWithType(`${env.JOBS_API_BASEURL}`, {
    headers: {
      Authorization: `Bearer ${env.JOBS_BEARER_TOKEN}`,
    },
  });
}

export async function getProtectedClient() {
  const user = await getUser();
  if (!user)
    throw new Error("You need to be authenticated");
  return hcWithType(`${env.JOBS_API_BASEURL}`, {
    headers: {
      "Authorization": `Bearer ${env.JOBS_BEARER_TOKEN}`,
      "x-user-role": user.role,
    },
  });
}

export function getWebhookClient() {
  return hcWithType(`${env.JOBS_API_BASEURL}`, {
    headers: {
      "Authorization": `Bearer ${env.JOBS_BEARER_TOKEN}`,
      "x-user-role": "webhook",
    },
  });
}
