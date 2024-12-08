import env from "@/env";
import { hcWithType } from "@delivery/jobs/hc";

const httpOptions = {
  headers: { Authorization: `Bearer ${env.JOBS_BEARER_TOKEN}` },
};
export const client = hcWithType(`${env.JOBS_API_BASEURL}`, httpOptions);
