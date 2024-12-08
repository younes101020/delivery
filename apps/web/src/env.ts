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

if (process.env.NEXT_RUNTIME === "nodejs") {
  expand(
    config({
      path: path.resolve(process.cwd(), process.env.NODE_ENV === "test" ? ".env.test" : ".env"),
    }),
  );

  serverEnv = serverEnvSchema.parse(process.env);
  const { data, error } = publicEnvSchema.safeParse(process.env);

  if (error) {
    console.error("❌ Invalid public env vars:");
    console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
    process.exit(1);
  }
  
  publicEnv = data;
}

export { publicEnv, serverEnv };
