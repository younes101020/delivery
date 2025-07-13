import { db } from "@delivery/drizzle";
import { applications } from "@delivery/drizzle/schema";
import { it as base } from "vitest";

interface ITFixtures {
  applicationName: string;
}

export const it = base.extend<ITFixtures>({
  applicationName: async ({}, use) => {
    const applicationName = await getApplicationName();
    await use(applicationName);
  },
});

async function getApplicationName() {
  const [application] = await db.select({ name: applications.name }).from(applications).limit(1);
  return application.name;
}
