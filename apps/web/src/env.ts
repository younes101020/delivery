/* eslint-disable node/no-process-env */
import { createEnv } from "@t3-oss/env-nextjs";
import { config } from "dotenv";
import { z } from "zod";

console.log(process.env.CI, "GITHUB ACTIOIN ENV");
if (process.env.GITHUB_ACTIONS !== "true") {
  config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });
}

export const env = createEnv({
  server: {
    AUTH_SECRET: z.string(),
    JOBS_BEARER_TOKEN: z.string(),
    JOBS_API_BASEURL: z.string(),
  },
  client: {
    NEXT_PUBLIC_BASEURL: z.string(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_BASEURL: process.env.NEXT_PUBLIC_BASEURL,
  },
  skipValidation: process.env.GITHUB_ACTIONS === "true",
});
