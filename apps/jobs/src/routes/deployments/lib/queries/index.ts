import { db } from "@delivery/drizzle";
import { systemConfig } from "@delivery/drizzle/schema";

export async function getWildcardDomain() {
  const [config] = await db.select({ wildcardDomain: systemConfig.wildcardDomain }).from(systemConfig).limit(1);
  return config?.wildcardDomain;
}
