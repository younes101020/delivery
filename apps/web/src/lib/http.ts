import { serverEnv } from "@/env";
import { hcWithType } from "@delivery/jobs/hc";

const httpOptions = {
  headers: { Authorization: `Bearer ${serverEnv.JOBS_BEARER_TOKEN}` },
};
export const client = hcWithType(`${serverEnv.JOBS_API_BASEURL}`, httpOptions);
