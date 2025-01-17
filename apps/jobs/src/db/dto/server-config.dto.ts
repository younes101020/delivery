import type { z } from "zod";

import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { systemConfig } from "../schema";

export const selectServerConfigSchema = createSelectSchema(systemConfig);
export const insertServerConfigSchema = createInsertSchema(systemConfig);
export const patchServerConfigSchema = insertServerConfigSchema.partial();

export type InsertServerConfigSchema = z.infer<typeof insertServerConfigSchema>;
