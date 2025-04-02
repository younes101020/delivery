import { it as base } from "vitest";

import { db } from "@/db";
import { applications } from "@/db/schema";

interface Fixtures {
  registeredApplicationId: number;
}

const registeredApplicationId = await getRandomRegisteredApplicationId();

export const it = base.extend<Fixtures>({
  // eslint-disable-next-line no-empty-pattern
  registeredApplicationId: async ({}, use) => {
    await use(registeredApplicationId);
  },
});

async function getRandomRegisteredApplicationId() {
  const [registeredApplication] = await db.select({ id: applications.id }).from(applications).limit(1);
  return registeredApplication.id;
}
