import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { systemConfig } from "../schema";

export const selectOnboardingSchema = createSelectSchema(systemConfig);
export const insertOnboardingSchema = createInsertSchema(systemConfig);
export const patchOnboardingSchema = insertOnboardingSchema.partial();
