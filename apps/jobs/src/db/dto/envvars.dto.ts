import type { z } from "zod";

import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { environmentVariables } from "../schema";

export const selectEnvironmentVariablesSchema = createSelectSchema(environmentVariables);
export const insertEnvironmentVariablesSchema = createInsertSchema(environmentVariables);

export type InsertEnvironmentVariablesSchema = z.infer<typeof insertEnvironmentVariablesSchema>;