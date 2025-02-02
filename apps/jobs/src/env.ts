/* eslint-disable node/no-process-env */
import { config } from "@dotenvx/dotenvx";
import { z } from "zod";

config();

const EnvSchema = z.object({
  NODE_ENV: z.string(),
  MINIO_ENDPOINT: z.string().default("localhost"),
  MINIO_PORT: z.coerce.number().default(9000),
  PORT: z.coerce.number().default(9999),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]),
  DATABASE_URL: z.string(),
  MINIO_PUBLIC_DOMAIN: z.string().default("http://localhost:9000"),
  MINIO_ROOT_USER: z.string().optional(),
  MINIO_ROOT_PASSWORD: z.string().optional(),
  MINIO_BUCKETS: z.string().default("screenshots"),
  TEST_USERS_PASSWORD: z.string().min(8).optional(),
  TEST_ENTITY_COUNT: z.coerce.number().default(10),
  SSH_HOST: z.string().default("host.docker.internal"),
  BEARER_TOKEN: z.string(),
}).superRefine((input, ctx) => {
  if (input.NODE_ENV === "test" && (!input.TEST_USERS_PASSWORD || !input.TEST_ENTITY_COUNT)) {
    ctx.addIssue({
      code: z.ZodIssueCode.invalid_type,
      expected: "string",
      received: "undefined",
      path: ["TEST_USERS_PASSWORD"],
      message: "Must be set when NODE_ENV is on 'test'",
    });
  }
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
