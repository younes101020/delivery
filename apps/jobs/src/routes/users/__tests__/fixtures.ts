import { faker } from "@faker-js/faker";
import { it as base } from "vitest";

import type { InsertUserSchema, SelectUserSchema } from "@/db/dto";

import { db } from "@/db";
import { users } from "@/db/schema";

interface Fixtures {
  userPayload: InsertUserSchema;
  registeredUser: SelectUserSchema;
}

const userPayload = {
  email: faker.internet.email(),
  password: faker.internet.password(),
};

export const it = base.extend<Fixtures>({
  // eslint-disable-next-line no-empty-pattern
  userPayload: async ({}, use) => {
    await use(userPayload);
  },
  // eslint-disable-next-line no-empty-pattern
  registeredUser: async ({}, use) => {
    const registeredUser = await getRandomRegisteredUser();
    await use(registeredUser);
  },
});

async function getRandomRegisteredUser() {
  const [registeredUser] = await db.select().from(users).limit(1);
  return registeredUser;
}
