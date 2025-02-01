import { drizzle } from "drizzle-orm/postgres-js";
import { seed } from "drizzle-seed";

import env from "@/env";
import { hashPassword } from "@/lib/auth";
import { encryptSecret } from "@/lib/utils";

import * as schema from "./schema";

const GITHUB_APP_PRIVATE_KEY
= `
  mL+IHQ/AH6tF0KMlJGQn+IrPIbdkfGJz4I3qVo7yp7JFN3lLfZ/ndndcE+kHGc3R
  rNntHJbXa1rDMDDpP4lmCtmMaX2hYcSsqhN4iQIDAQABAoIBAHfZe0e4zYpR3mGW
  xvd6rCX9Jf3dIJ8nVzzSEk3ZOhtUEZYG+PcZLh6jwwFH1wO7K+LwFlBNr/RMaBOU`;
const SECRET = await encryptSecret(GITHUB_APP_PRIVATE_KEY);

async function main() {
  const db = drizzle(env.DATABASE_URL);
  const passwordHash = await hashPassword(env.TEST_USERS_PASSWORD!);
  await seed(db, schema).refine(f => ({
    users: {
      columns: {
        passwordHash: f.default({ defaultValue: passwordHash }),
      },
    },
    githubApp: {
      count: 5,
      with: {
        applications: 10,
        githubAppSecret: 1,
      },
    },
    githubAppSecret: {
      columns: {
        key: f.default({ defaultValue: SECRET.key }),
        iv: f.default({ defaultValue: SECRET.iv }),
        encryptedData: f.default({ defaultValue: SECRET.encryptedData }),
      },
    },
    systemConfig: {
      count: 0,
    },
  }));
  process.exit(0);
}

main().catch((err) => {
  console.error(`Error when seeding database: ${err}`);
  process.exit(1);
});
