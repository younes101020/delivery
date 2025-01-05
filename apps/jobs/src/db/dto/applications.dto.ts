import { createInsertSchema, createSelectSchema } from "drizzle-zod";
// eslint-disable-next-line ts/consistent-type-imports
import { z } from "zod";

import { applications } from "../schema";

export const selectApplicationsSchema = createSelectSchema(applications);
export const insertApplicationsSchema = createInsertSchema(applications);
export const patchApplicationsSchema = insertApplicationsSchema.partial();

export type InsertApplicationSchema = z.infer<typeof insertApplicationsSchema>;
