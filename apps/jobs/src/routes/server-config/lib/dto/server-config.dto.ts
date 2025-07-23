import { systemConfig } from "@delivery/drizzle/schema";
import { z } from "@hono/zod-openapi";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const selectServerConfigSchema = createSelectSchema(systemConfig).extend({ publicIp: z.string() });
export const insertServerConfigSchema = createInsertSchema(systemConfig);
export const patchServerConfigSchema = insertServerConfigSchema.partial();

export const selectServerWebServiceConfigSchema = z.object({
  name: z.string(),
  fqdn: z.string().optional(),
  serviceId: z.string(),
});
export const patchServerWebServiceConfigSchema = selectServerWebServiceConfigSchema.partial();

export type GetServerWebServiceConfigSchema = z.infer<typeof selectServerWebServiceConfigSchema>;
export type InsertServerConfigSchema = z.infer<typeof insertServerConfigSchema>;
export type PatchServerWebServiceConfigSchema = z.infer<typeof patchServerWebServiceConfigSchema>;
