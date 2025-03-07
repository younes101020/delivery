import { it as base } from "vitest";

import { db } from "@/db";
import { applications } from "@/db/schema";

interface Fixtures {
  registeredApplicationName: string;
}

const registeredApplicationName = await getRandomRegisteredApplicationName();

export const it = base.extend<Fixtures>({
  // eslint-disable-next-line no-empty-pattern
  registeredApplicationName: async ({}, use) => {
    await use(registeredApplicationName);
  },
});

async function getRandomRegisteredApplicationName() {
  const [registeredApplication] = await db.select({ name: applications.name }).from(applications).limit(1);
  return registeredApplication.name;
}
