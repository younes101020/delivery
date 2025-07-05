import "server-only";

import { hcWithType } from "@delivery/jobs/hc";

import { env } from "@/env";

export const client = hcWithType(`${env.JOBS_API_BASEURL}`, {
  headers: {
    "Authorization": `Bearer ${env.JOBS_BEARER_TOKEN}`,
  },
});