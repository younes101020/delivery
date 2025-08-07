import { db } from "@delivery/drizzle";
import { users } from "@delivery/drizzle/schema";
import { faker } from "@faker-js/faker";
import { eq, not } from "drizzle-orm";
import { it as base } from "vitest";

import env from "@/env";

import type { AuthRegisterSchema, AuthVerifySchema } from "../lib/dto";

interface Fixtures {
  authRegisteredUser: AuthVerifySchema;
  authUnregisteredUser: AuthRegisterSchema;
}

const authRegisteredUser = {
  email: "",
  password: env.TEST_USERS_PASSWORD!,
};

const authUnregisteredUser = {
  email: faker.internet.email(),
  password: faker.internet.password(),
};

export const it = base.extend<Fixtures>({
  authRegisteredUser: async ({}, use) => {
    //  For each test, use a different email
    const [user] = await getRandomUserEmail(authRegisteredUser.email);
    authRegisteredUser.email = user.email;
    await use(authRegisteredUser);
  },
  authUnregisteredUser: async ({}, use) => {
    await use(authUnregisteredUser);
  },
});

function getRandomUserEmail(previousEmail: string) {
  return db.select({ email: users.email }).from(users).where(not(eq(users.email, previousEmail))).limit(1);
}
