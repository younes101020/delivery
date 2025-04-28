/* eslint-disable node/no-process-env */
import { config } from "dotenv";
import { z } from "zod";

if (process.env.CI !== "true") {
  config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });
}

const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  MINIO_ENDPOINT: z.string().default("localhost"),
  MINIO_PORT: z.coerce.number().default(9000),
  PORT: z.coerce.number().default(9999),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]),
  DATABASE_URL: z.string(),
  MINIO_PUBLIC_DOMAIN: z.string(),
  MINIO_ROOT_USER: z.string(),
  MINIO_ROOT_PASSWORD: z.string(),
  MINIO_BUCKETS: z.string().default("screenshots"),
  TEST_USERS_PASSWORD: z.string().min(8).default("azerty-azerty"),
  TEST_ENTITY_COUNT: z.coerce.number().default(10),
  SSH_HOST: z.string().default("host.docker.internal"),
  BEARER_TOKEN: z.string(),
});

export type env = z.infer<typeof EnvSchema>;

// eslint-disable-next-line ts/no-redeclare
const { data: env, error } = EnvSchema.safeParse(process.env);

if (error) {
  console.error("❌ Invalid env:");
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export default env!;
