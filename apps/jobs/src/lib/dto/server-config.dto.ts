import { systemConfig } from "@delivery/drizzle/schema";
import { z } from "@hono/zod-openapi";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const selectServerConfigSchema = createSelectSchema(systemConfig);
export const insertServerConfigSchema = createInsertSchema(systemConfig);
export const patchServerConfigSchema = insertServerConfigSchema.partial();

export const selectServerInstanceConfigSchema = z.object({
  name: z.string(),
  fqdn: z.string().optional(),
});
export const patchServerInstanceConfigSchema = selectServerInstanceConfigSchema.partial();

export type InsertServerConfigSchema = z.infer<typeof insertServerConfigSchema>;
