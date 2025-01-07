import { createInsertSchema, createSelectSchema } from "drizzle-zod";
// eslint-disable-next-line ts/consistent-type-imports
import { z } from "zod";

import { applicationEnvironmentVariables, environmentVariables } from "../schema";

export const selectEnvironmentVariablesSchema = createSelectSchema(environmentVariables);
export const insertEnvironmentVariablesSchema = createInsertSchema(environmentVariables)
  .required({
    key: true,
    value: true,
  })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  });

export const selectApplicationEnvironmentVariablesSchema = createSelectSchema(
  applicationEnvironmentVariables,
);
export const insertApplicationEnvironmentVariablesSchema = createInsertSchema(
  applicationEnvironmentVariables,
)
  .required({
    applicationId: true,
    environmentVariableId: true,
  })
  .omit({
    id: true,
  });

export type InsertEnvironmentVariablesSchema = z.infer<typeof insertEnvironmentVariablesSchema>;
