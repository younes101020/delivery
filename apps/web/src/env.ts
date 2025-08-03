/* eslint-disable node/no-process-env */
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

let rawEnv: ReturnType<typeof createEnv>;

if (process.env.WEB_BASE_URL) {
  rawEnv = createEnv({
    server: {
      AUTH_SECRET: z.string(),
      JOBS_BEARER_TOKEN: z.string(),
      JOBS_API_BASEURL: z.string(),
      WEB_BASE_URL: z.string(),
      NODE_ENV: z.string(),
    },
    experimental__runtimeEnv: {},
    skipValidation: process.env.CI === "true" || process.env.LINT === "true" || process.env.NODE_ENV === "test",
  });
}

const env = rawEnv;

export { env };
