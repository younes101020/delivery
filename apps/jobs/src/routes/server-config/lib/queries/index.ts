import { db } from "@delivery/drizzle";
import { systemConfig } from "@delivery/drizzle/schema";

import type { InsertServerConfigSchema } from "../dto/server-config.dto";

export async function updateSystemConfig(updates: Partial<InsertServerConfigSchema>) {
  const [updatedConfig] = await db
    .update(systemConfig)
    .set(updates)
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
