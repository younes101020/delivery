/* eslint-disable node/no-process-env */
import { config } from "dotenv";
import { z } from "zod/v4";

if (process.env.CI !== "true") {
  config({ path: process.env.NODE_ENV === "test" ? "../../.env.test" : "../../.env" });
}

const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PUBLIC_IP: process.env.NODE_ENV === "production" ? z.string() : z.string().default("localhost"),
  PORT: z.coerce.number().default(9999),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]),
  REDIS_PASSWORD: z.string(),
  DATABASE_URL: z.string(),
  TEST_USERS_PASSWORD: z.string().min(8).default("azerty-azerty"),
  TEST_ENTITY_COUNT: z.coerce.number().default(11),
  SSH_HOST: z.string().default("host.docker.internal"),
  BEARER_TOKEN: z.string(),
  CI: z.string().default("false"),
  ENABLE_DEPLOYMENT_QUEUE_MONITORING: z.string().default("false"),
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
