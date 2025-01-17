/* eslint-disable node/no-process-env */
import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path from "node:path";
import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z.string(),
  AUTH_SECRET: z.string(),
  JOBS_BEARER_TOKEN: z.string(),
  JOBS_API_BASEURL: z.string(),
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_BASEURL: z.string(),
});

let publicEnvResult;
let serverEnvResult;

const envValidation = process.env.NEXT_RUNTIME === "nodejs" || process.env.NODE_ENV === "test";

if (envValidation) {
  expand(
    config({
      path: path.resolve(process.cwd(), process.env.NODE_ENV === "test" ? ".env.test" : ".env"),
    }),
  );

  const serverEnvParse = serverEnvSchema.safeParse(process.env);
  if (serverEnvParse.success) {
    serverEnvResult = serverEnvParse.data;
  }
  else {
    console.error("❌ Invalid server env vars:");
    console.error(JSON.stringify(serverEnvParse.error.flatten().fieldErrors, null, 2));
    process.exit(1);
  }

  const publicEnvParse = publicEnvSchema.safeParse(process.env);
  if (publicEnvParse.success) {
    publicEnvResult = publicEnvParse.data;
  }
  else {
    console.error("❌ Invalid public env vars:");
    console.error(JSON.stringify(publicEnvParse.error.flatten().fieldErrors, null, 2));
    process.exit(1);
  }
}

const publicEnv = publicEnvResult as unknown as z.infer<typeof publicEnvSchema>;
const serverEnv = serverEnvResult as unknown as z.infer<typeof serverEnvSchema>;

export {
  publicEnv,
  serverEnv,
};
