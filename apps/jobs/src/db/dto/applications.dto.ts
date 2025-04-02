import { z } from "@hono/zod-openapi";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { applications, environmentVariables } from "../schema";
import { insertEnvironmentVariablesSchema } from "./envvars.dto";

export const selectApplicationsSchemaWithSharedEnv = createSelectSchema(applications).extend({
  environmentVariable: z.array(createSelectSchema(environmentVariables)).optional(),
});
export const selectApplicationsSchema = createSelectSchema(applications);

const insertApplicationsSchema = createInsertSchema(applications).omit({ name: true });
export const insertApplicationWithSharedEnv = z.object({
  applicationData: insertApplicationsSchema,
  envVars: z.array(insertEnvironmentVariablesSchema).optional(),
});

export const patchApplicationsSchema = z.object({
  applicationData: insertApplicationsSchema.partial(),
  environmentVariable: z.array(
    z.union([
      // patch environment variables case
      z.union([
        insertEnvironmentVariablesSchema.partial({ key: true }).required({ id: true }),
        insertEnvironmentVariablesSchema.partial({ value: true }).required({ id: true }),
      ]),
      // insert new environment variables case
      insertEnvironmentVariablesSchema,
    ]),
  ).optional(),
});

export type InsertApplicationSchemaWithSharedEnv = z.infer<typeof insertApplicationWithSharedEnv>;
export type PatchApplicationSchema = z.infer<typeof patchApplicationsSchema>;
