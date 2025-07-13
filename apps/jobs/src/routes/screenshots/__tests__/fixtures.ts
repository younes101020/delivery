import { db } from "@delivery/drizzle";
import { applications } from "@delivery/drizzle/schema";
import { it as base } from "vitest";

interface Fixtures {
  registeredApplicationName: string;
}

const registeredApplicationName = await getRandomRegisteredApplicationName();

export const it = base.extend<Fixtures>({
  registeredApplicationName: async ({}, use) => {
    await use(registeredApplicationName);
  },
});

async function getRandomRegisteredApplicationName() {
  const [registeredApplication] = await db.select({ name: applications.name }).from(applications).limit(1);
  return registeredApplication.name;
}
