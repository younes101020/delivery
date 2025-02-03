import { hcWithType } from "@delivery/jobs/hc";

import { env } from "@/env";

const httpOptions = {
  headers: { Authorization: `Bearer ${env.JOBS_BEARER_TOKEN}` },
};
export const client = hcWithType(`${env.JOBS_API_BASEURL}`, httpOptions);
