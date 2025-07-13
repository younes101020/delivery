/* eslint-disable node/no-process-env */
import { createEnv } from "@t3-oss/env-nextjs";
import { config } from "dotenv";
import { z } from "zod";

if (process.env.CI !== "true") {
  config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });
}

export const env = createEnv({
  server: {
    AUTH_SECRET: z.string(),
    JOBS_BEARER_TOKEN: z.string(),
    JOBS_API_BASEURL: z.string(),
    BASE_URL: z.string(),
  },
  experimental__runtimeEnv: {},
  skipValidation: process.env.CI === "true" || process.env.LINT === "true",
});
