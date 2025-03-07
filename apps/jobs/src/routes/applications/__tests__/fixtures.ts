import { it as base } from "vitest";

import { db } from "@/db";
import { applications } from "@/db/schema";

interface ITFixtures {
  applicationName: string;
}

export const it = base.extend<ITFixtures>({
  // eslint-disable-next-line no-empty-pattern
  applicationName: async ({}, use) => {
    const applicationName = await getApplicationName();
    await use(applicationName);
  },
});

async function getApplicationName() {
  const [application] = await db.select({ name: applications.name }).from(applications).limit(1);
  return application.name;
}
