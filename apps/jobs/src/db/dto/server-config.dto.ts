import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { systemConfig } from "../schema";

export const selectServerConfigSchema = createSelectSchema(systemConfig);
export const insertServerConfigSchema = createInsertSchema(systemConfig);
export const patchServerConfigSchema = insertServerConfigSchema.partial();
