import { z } from "zod";

const envSchema = z.object({
  AUTH_SECRET: z.string(),
  JOBS_BEARER_TOKEN: z.string(),
  JOBS_API_BASEURL: z.string().url(),
});

const { data: env, error } = envSchema.safeParse(process.env);

if (error) {
  console.error("❌ Invalid env:");
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export default env!;
