import { eq } from "drizzle-orm";

import type {
  AuthRegisterSchema,
  InsertGithubAppSchema,
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

export async function createGithubAppWithSecret(newGithubApp: InsertGithubAppSchema, secret: {
  encryptedData: string;
  iv: string;
  key: string;
}) {
  return db.transaction(async (tx) => {
    const [insertedSecret] = await tx.insert(githubAppSecret).values(secret).returning({ id: githubAppSecret.id });
    newGithubApp.secretId = insertedSecret.id;

    const [insertedGithubApp] = await tx.insert(githubApp).values(newGithubApp).returning();
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

export async function getApplicationWithEnvVarsById(id: number) {
  return await db.query.applications.findFirst({
    where: eq(applications.id, id),
    with: {
      applicationEnvironmentVariables: {
        with: {
          environmentVariable: true,
        },
      },
    },
  });
}

export async function patchApplication(id: number, updates: PatchApplicationSchema) {
  return await db.transaction(async (tx) => {
    const { applicationData, environmentVariable } = updates;

    let application: PatchApplicationSchema | null = null;

    if (Object.keys(applicationData).length > 0) {
      const [updatedApplication] = await tx
        .update(applications)
        .set({ ...applicationData, updatedAt: new Date() })
        .where(eq(applications.id, id))
        .returning();

      application = Object.assign({}, { applicationData: updatedApplication });
    }

    const environmentVariablesRelatedToApp: PatchApplicationSchema["environmentVariable"] = [];

    if (environmentVariable?.length) {
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
              applicationId: id,
              environmentVariableId: insertedEnvVar.id,
            });

            environmentVariablesRelatedToApp.push(insertedEnvVar);
          }
        }),
      );
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

export async function deleteApplicationById(id: number) {
  const [result] = await db
    .delete(applications)
    .where(eq(applications.id, id))
    .returning({ name: applications.name });
  return result?.name;
}

export async function getApplicationNameById(id: number) {
  const [result] = await db
    .select({ name: applications.name })
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1);

  return result?.name;
}
