import { eq } from "drizzle-orm";

import type {
  AuthRegisterSchema,
  InsertGithubAppSchema,
  InsertGithubAppsSecretSchema,
  InsertServerConfigSchema,
  InsertUserSchema,
} from "../dto";
import type {
  InsertApplicationSchemaWithSharedEnv,
  PatchApplicationSchema,
} from "../dto/applications.dto";
import type { InsertEnvironmentVariablesSchema } from "../dto/envvars.dto";

import { db } from "..";
import {
  applicationEnvironmentVariables,
  applications,
  environmentVariables,
  githubApp,
  githubAppSecret,
  systemConfig,
  users,
} from "../schema";

export async function createApplication(application: InsertApplicationSchemaWithSharedEnv) {
  const { applicationData, envVars } = application;
  return await db.transaction(async (tx) => {
    const existingApp = await tx.query.applications.findFirst({
      where(fields, operators) {
        return operators.eq(fields.fqdn, applicationData.fqdn);
      },
    });

    if (existingApp) {
      return { id: 0 };
    }

    const [application] = await tx.insert(applications).values(applicationData).returning({
      id: applications.id,
    });

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

export async function getSystemDomainName() {
  const config = await db.query.systemConfig.findFirst({
    columns: {
      domainName: true,
    },
  });
  return config?.domainName;
}

export async function getGithubAppByAppId(appId: number) {
  return await db.query.githubApp.findFirst({
    where(fields, operators) {
      return operators.eq(fields.appId, appId);
    },
    with: {
      secret: true,
    },
  });
}

export async function getSystemConfig() {
  return await db.query.systemConfig.findFirst();
}

export async function getSystemConfigFqdn() {
  const systemConfig = await db.query.systemConfig.findFirst({
    columns: {
      domainName: true,
    },
  });
  return systemConfig?.domainName;
}

export async function setUser(user: Omit<AuthRegisterSchema, "password">, passwordHash: string) {
  const [inserted] = await db
    .insert(users)
    .values({ ...user, passwordHash })
    .returning();
  return inserted;
}

export async function getUserByEmail(email: string) {
  return await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.email, email);
    },
  });
}

export async function getGithubApps() {
  return await db.query.githubApp.findMany({
    with: {
      secret: true,
    },
  });
}

export async function getGithubAppById(id: number) {
  return await db.query.githubApp.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
    with: {
      secret: true,
    },
  });
}

export async function createGithubAppWithSecret(newGithubApp: InsertGithubAppSchema, secret: Omit<InsertGithubAppsSecretSchema, "githubAppId">) {
  return db.transaction(async (tx) => {
    const [insertedGithubApp] = await tx.insert(githubApp).values(newGithubApp).returning();
    const secretWithGithubAppId = { ...secret, githubAppId: insertedGithubApp.id };
    await tx.insert(githubAppSecret).values([secretWithGithubAppId]);
    return insertedGithubApp;
  });
}

export async function updateGithubApp(id: number, updates: Partial<InsertGithubAppSchema>) {
  const [updatedGithubApp] = await db
    .update(githubApp)
    .set(updates)
    .where(eq(githubApp.appId, id))
    .returning();
  return updatedGithubApp;
}

export async function createEnvironmentVariable(
  environmentVariable: InsertEnvironmentVariablesSchema,
) {
  const [inserted] = await db.insert(environmentVariables).values(environmentVariable).returning();
  return inserted;
}

export async function updateSystemConfig(updates: Partial<InsertServerConfigSchema>) {
  const [updatedConfig] = await db
    .update(systemConfig)
    .set(updates)
    .where(eq(systemConfig.id, db.select({ id: systemConfig.id }).from(systemConfig).limit(1)))
    .returning();
  return updatedConfig;
}

export async function createUser(user: InsertUserSchema, passwordHash: string) {
  const [inserted] = await db
    .insert(users)
    .values({ ...user, passwordHash })
    .returning();
  return inserted;
}

export async function getUserById(id: number) {
  const user = await db.query.users
    .findFirst({
      where(fields, operators) {
        return operators.eq(fields.id, id);
      },
    })
    .then((user) => {
      if (user) {
        const { passwordHash, ...rest } = user;
        return rest;
      }
      return null;
    });
  return user;
}

export async function updateUser(id: number, updates: Partial<InsertUserSchema>) {
  const [updatedUser] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, id))
    .returning({
      id: users.id,
    });
  return updatedUser;
}

export async function getApplications() {
  return await db.query.applications.findMany();
}

export async function getApplicationsNames() {
  return await db.query.applications.findMany({
    columns: {
      name: true,
    },
  });
}

export async function getApplicationWithEnvVarsByName(name: string) {
  return await db.query.applications.findFirst({
    where: eq(applications.name, name),
    with: {
      applicationEnvironmentVariables: {
        with: {
          environmentVariable: true,
        },
      },
    },
  });
}

export async function patchApplication(name: string, updates: PatchApplicationSchema) {
  return await db.transaction(async (tx) => {
    const { applicationData, environmentVariable } = updates;

    let application: Omit<PatchApplicationSchema, "environmentVariable"> | null = null;

    const [app] = await tx.select({ id: applications.id }).from(applications).where(eq(applications.name, name)).limit(1);

    if (Object.keys(applicationData).length > 0) {
      const [updatedApplication] = await tx
        .update(applications)
        .set({ ...applicationData, updatedAt: new Date() })
        .where(eq(applications.name, name))
        .returning();

      application = Object.assign({}, { applicationData: updatedApplication });
    }

    const environmentVariablesRelatedToApp: PatchApplicationSchema["environmentVariable"] = [];

    if (environmentVariable) {
      if (environmentVariable?.length === 0) {
        await tx
          .delete(applicationEnvironmentVariables)
          .where(eq(applicationEnvironmentVariables.applicationId, app.id));
      }
      else {
        await Promise.all(
          environmentVariable.map(async (envVar) => {
          // PATCH ENV CASE
            if ("id" in envVar && envVar.id) {
              const [updatedEnvVar] = await tx
                .update(environmentVariables)
                .set({ ...envVar, updatedAt: new Date() })
                .where(eq(environmentVariables.id, envVar.id))
                .returning();

              environmentVariablesRelatedToApp.push(updatedEnvVar);
            }
            // INSERT ENV CASE
            else if (envVar.key && envVar.value) {
              const { key, value } = envVar;
              const [insertedEnvVar] = await tx
                .insert(environmentVariables)
                .values({ key, value })
                .returning();

              await tx.insert(applicationEnvironmentVariables).values({
                applicationId: app.id,
                environmentVariableId: insertedEnvVar.id,
              });

              environmentVariablesRelatedToApp.push(insertedEnvVar);
            }
          }),
        );
      }
    }

    return {
      ...(application && {
        applicationData: application.applicationData,
      }),
      ...(environmentVariablesRelatedToApp.length > 0 && {
        environmentVariable: environmentVariablesRelatedToApp,
      }),
    };
  });
}

export async function deleteApplicationByName(name: string) {
  return await db.transaction(async (tx) => {
    await tx
      .delete(applicationEnvironmentVariables)
      .where(eq(applicationEnvironmentVariables.applicationId, db.select({ id: applications.id }).from(applications).where(eq(applications.name, name)).limit(1)));

    return await tx
      .delete(applications)
      .where(eq(applications.name, name));
  });
}

export async function getEnvironmentVariablesForApplication(applicationId: number) {
  return await db
    .select({
      key: environmentVariables.key,
      value: environmentVariables.value,
      isBuildTime: environmentVariables.isBuildTime,
    })
    .from(applicationEnvironmentVariables)
    .innerJoin(environmentVariables, eq(applicationEnvironmentVariables.environmentVariableId, environmentVariables.id))
    .where(eq(applicationEnvironmentVariables.applicationId, applicationId));
}

export async function getApplicationIdByName(name: string) {
  const [application] = await db
    .select({ id: applications.id })
    .from(applications)
    .where(eq(applications.name, name))
    .limit(1);

  return application;
}
