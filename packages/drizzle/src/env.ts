/* eslint-disable node/no-process-env */
import { config } from "dotenv";
import { z } from "zod";

if (process.env.CI !== "true") {
  config({ path: process.env.NODE_ENV === "test" ? "../../.env.test" : "../../.env" });
}

const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  DATABASE_URL: z.string(),
  TEST_USERS_PASSWORD: z.string().min(8).default("azerty-azerty"),
  TEST_ENTITY_COUNT: z.coerce.number().default(11),
  CI: z.string().default("false"),
});

export type env = z.infer<typeof EnvSchema>;

// eslint-disable-next-line ts/no-redeclare
const { data: env, error } = EnvSchema.safeParse(process.env);

if (error) {
  console.error("❌ Invalid env:");
  console.error(JSON.stringify(z.treeifyError(error), null, 2));
  process.exit(1);
}

export default env!;
