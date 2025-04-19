import type { z } from "@hono/zod-openapi";

import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { environmentVariables } from "../schema";

export const selectEnvironmentVariablesSchema = createSelectSchema(environmentVariables);
export const insertEnvironmentVariablesSchema = createInsertSchema(environmentVariables);
export const patchEnvironmentVariablesSchema = createInsertSchema(environmentVariables).partial();

export type InsertEnvironmentVariablesSchema = z.infer<typeof insertEnvironmentVariablesSchema>;
export type PatchEnvironmentVariablesSchema = z.infer<typeof patchEnvironmentVariablesSchema>;
