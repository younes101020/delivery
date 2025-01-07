import type { InsertApplicationSchema } from "./dto/applications.dto";
import type { InsertEnvironmentVariablesSchema } from "./dto/envvars.dto";

import { db } from ".";
import { applicationEnvironmentVariables, applications, environmentVariables } from "./schema";

export async function createApplication(
  applicationData: InsertApplicationSchema,
  envVars: InsertEnvironmentVariablesSchema[] | undefined,
) {
  return await db.transaction(async (tx) => {
    const [application] = await tx.insert(applications).values(applicationData).returning();

    if (envVars) {
      const envVarRecords = await tx.insert(environmentVariables).values(envVars).returning();

      await tx.insert(applicationEnvironmentVariables).values(
        envVarRecords.map(env => ({
          applicationId: application.id,
          environmentVariableId: env.id,
        })),
      );
    }

    return application;
  });
}

export async function getApplicationByName(name: string) {
  return await db.query.applications.findFirst({
    columns: {
      id: true,
    },
    where(fields, operators) {
      return operators.eq(fields.name, name);
    },
  });
}
