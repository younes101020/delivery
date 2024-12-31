import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path from "node:path";
import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z.string(),
  AUTH_SECRET: z.string(),
  JOBS_BEARER_TOKEN: z.string(),
  JOBS_API_BASEURL: z.string().url(),
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_BASEURL: z.string().url(),
});

let publicEnv: z.infer<typeof publicEnvSchema>;
let serverEnv: z.infer<typeof serverEnvSchema>;

const envValidation = process.env.NEXT_RUNTIME === "nodejs" || process.env.NODE_ENV === "test";

if (envValidation) {
  expand(
    config({
      path: path.resolve(process.cwd(), process.env.NODE_ENV === "test" ? ".env.test" : ".env"),
    }),
  );

  const serverEnvResult = serverEnvSchema.safeParse(process.env);
  if (serverEnvResult.success) {
    serverEnv = serverEnvResult.data;
  } else {
    console.error("❌ Invalid server env vars:");
    console.error(JSON.stringify(serverEnvResult.error.flatten().fieldErrors, null, 2));
    process.exit(1);
  }

  const publicEnvResult = publicEnvSchema.safeParse(process.env);
  if (publicEnvResult.success) {
    publicEnv = publicEnvResult.data;
  } else {
    console.error("❌ Invalid public env vars:");
    console.error(JSON.stringify(publicEnvResult.error.flatten().fieldErrors, null, 2));
    process.exit(1);
  }
}

export { publicEnv, serverEnv };
