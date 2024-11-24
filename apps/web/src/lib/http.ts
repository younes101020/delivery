import env from "@/env";
import { AppType } from "@delivery/jobs/http";
import { hc } from "hono/client";

export const client = hc<AppType>(`${env.JOBS_API_BASEURL}`);
