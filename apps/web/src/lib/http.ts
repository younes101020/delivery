import { hcWithType } from "@delivery/jobs/hc";

import { serverEnv } from "@/env";

const httpOptions = {
  headers: { Authorization: `Bearer ${serverEnv.JOBS_BEARER_TOKEN}` },
};
export const client = hcWithType(`${serverEnv.JOBS_API_BASEURL}`, httpOptions);
