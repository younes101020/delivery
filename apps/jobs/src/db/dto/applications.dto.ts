import { createInsertSchema, createSelectSchema } from "drizzle-zod";
// eslint-disable-next-line ts/consistent-type-imports
import { z } from "zod";

import { applications, environmentVariables } from "../schema";
import { insertEnvironmentVariablesSchema } from "./envvars.dto";

export const selectApplicationsSchemaWithSharedEnv = createSelectSchema(applications).extend({
  environmentVariables: z.array(createSelectSchema(environmentVariables)),
});
export const selectApplicationsSchema = createSelectSchema(applications);

const insertApplicationsSchema = createInsertSchema(applications).omit({ name: true });
export const insertApplicationWithSharedEnv = z.object({
  applicationData: insertApplicationsSchema,
  envVars: z.array(insertEnvironmentVariablesSchema).optional(),
});

export const patchApplicationsSchema = z.object({
  applicationData: insertApplicationsSchema.partial(),
  envVars: z.array(
    z.union([
      // patch environment variables case
      z.union([
        insertEnvironmentVariablesSchema.partial({ key: true }).required({ id: true }),
        insertEnvironmentVariablesSchema.partial({ value: true }).required({ id: true }),
      ]),
      // insert new environment variables case
      insertEnvironmentVariablesSchema,
    ]),
  ),
});

export type InsertApplicationSchemaWithSharedEnv = z.infer<typeof insertApplicationWithSharedEnv>;
export type PatchApplicationSchema = z.infer<typeof patchApplicationsSchema>;
