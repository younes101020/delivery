import { db } from "@delivery/drizzle";
import { systemConfig } from "@delivery/drizzle/schema";
import { eq } from "drizzle-orm";

import type { InsertServerConfigSchema } from "../dto/server-config.dto";

export async function updateSystemConfig(updates: Partial<InsertServerConfigSchema>) {
  const [updatedConfig] = await db
    .update(systemConfig)
    .set(updates)
    .where(eq(systemConfig.id, db.select({ id: systemConfig.id }).from(systemConfig).limit(1)))
    .returning();
  return updatedConfig;
}

export async function getSystemConfigFqdn() {
  const systemConfig = await db.query.systemConfig.findFirst({
    columns: {
      domainName: true,
    },
  });
  return systemConfig?.domainName;
}

export async function getSystemConfig() {
  return await db.query.systemConfig.findFirst();
}
