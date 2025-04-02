import { it as base } from "vitest";

import { db } from "@/db";
import { applications } from "@/db/schema";

interface ITFixtures {
  applicationId: string;
}

export const it = base.extend<ITFixtures>({
  // eslint-disable-next-line no-empty-pattern
  applicationId: async ({}, use) => {
    const applicationId = await getApplicationId();
    await use(applicationId);
  },
});

async function getApplicationId() {
  const [application] = await db.select({ id: applications.id }).from(applications).limit(1);
  return application.id.toString();
}
