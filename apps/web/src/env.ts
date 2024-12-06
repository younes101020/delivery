import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path from "node:path";
import { z } from "zod";

expand(
  config({
    path: path.resolve(process.cwd(), process.env.NODE_ENV === "test" ? ".env.test" : ".env"),
  }),
);

const envSchema = z.object({
  NODE_ENV: z.string(),
  AUTH_SECRET: z.string(),
  JOBS_BEARER_TOKEN: z.string(),
  JOBS_API_BASEURL: z.string().url(),
  NEXT_PUBLIC_BASEURL: z.string().url(),
});

const { data: env, error } = envSchema.safeParse(process.env);

if (error) {
  console.error("❌ Invalid env:");
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export default env!;
