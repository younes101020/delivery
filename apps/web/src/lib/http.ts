import env from "@/env";
import { AppType } from "@delivery/jobs/http";
import { hc } from "hono/client";

const httpOptions = {
  headers: { Authorization: `Bearer ${env.JOBS_BEARER_TOKEN}` },
};
export const client = hc<AppType>(`${env.JOBS_API_BASEURL}`, httpOptions);
