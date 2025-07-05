import { faker } from "@faker-js/faker";
import { it as base } from "vitest";

import type { InsertUserSchema, SelectUserSchema } from "@/db/dto";

import { db } from "@/db";
import { teams } from "@/db/schema";

interface Fixtures {
  randomRegisteredTeamId: string;
}

export const it = base.extend<Fixtures>({
  randomRegisteredTeamId: async ({}, use) => {
    const randomRegisteredTeamId = await getRandomRegisteredTeamId();
    await use(randomRegisteredTeamId);
  },
});

async function getRandomRegisteredTeamId() {
  const [registeredUser] = await db.select().from(teams).limit(1);
  return registeredUser.id.toString();
}
