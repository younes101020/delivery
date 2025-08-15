import { applications, environmentVariables } from "@delivery/drizzle/schema";
import { z } from "@hono/zod-openapi";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { IdParamsSchema } from "stoker/openapi/schemas";

import { insertEnvironmentVariablesSchema } from "./envvars.dto";
import { servicesDto } from "./services.dto";

export const selectApplicationsSchemaWithSharedEnv = createSelectSchema(applications).extend({
  environmentVariables: z
    .array(
      createSelectSchema(environmentVariables),
    )
    .optional(),
  serviceId: z.string(),
});

export const selectApplicationsSchema = servicesDto;

const insertApplicationsSchema = createInsertSchema(applications);
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
  ).refine((environmentVariables) => {
    const withoutDuplicates = Array.from(
      new Map(
        environmentVariables.map(environmentVariable => [
          environmentVariable.key,
          environmentVariable,
        ]),
      ).values(),
    );
    return withoutDuplicates.length === environmentVariables.length;
  }, {
    message: "Environment variables must not contain duplicates.",
  }).optional(),
});

export const ApplicationParamsSchema = z.object({
  name: z.string(),
});

export const ApplicationServiceParamsSchema = IdParamsSchema.extend({ id: z.string() }).describe("The application swarm service id.");

export type InsertApplicationSchemaWithSharedEnv = z.infer<typeof insertApplicationWithSharedEnv>;
export type PatchApplicationSchema = z.infer<typeof patchApplicationsSchema>;
