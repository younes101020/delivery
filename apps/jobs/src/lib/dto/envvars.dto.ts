import type { z } from "@hono/zod-openapi";

import { environmentVariables } from "@delivery/drizzle/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const selectEnvironmentVariablesSchema = createSelectSchema(environmentVariables);
export const insertEnvironmentVariablesSchema = createInsertSchema(environmentVariables);
export const patchEnvironmentVariablesSchema = createInsertSchema(environmentVariables).partial();

export type InsertEnvironmentVariablesSchema = z.infer<typeof insertEnvironmentVariablesSchema>;
export type PatchEnvironmentVariablesSchema = z.infer<typeof patchEnvironmentVariablesSchema>;
