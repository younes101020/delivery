import { createInsertSchema, createSelectSchema } from "drizzle-zod";
// eslint-disable-next-line ts/consistent-type-imports
import { z } from "zod";

import { systemConfig } from "../schema";

export const selectServerConfigSchema = createSelectSchema(systemConfig);
export const insertServerConfigSchema = createInsertSchema(systemConfig);
export const patchServerConfigSchema = insertServerConfigSchema.partial();

export type InsertServerConfigSchema = z.infer<typeof insertServerConfigSchema>;
