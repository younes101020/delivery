import { eq } from "drizzle-orm";

import type {
  InsertGithubAppsSchema,
  InsertGithubAppsSecretSchema,
  InsertServerConfigSchema,
  InsertUsersSchema,
} from "./dto";
import type { InsertApplicationSchema } from "./dto/applications.dto";
import type { InsertEnvironmentVariablesSchema } from "./dto/envvars.dto";

import { db } from ".";
import {
  applicationEnvironmentVariables,
  applications,
  environmentVariables,
  githubApp,
  githubAppSecret,
  systemConfig,
  users,
} from "./schema";

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

export async function createGithubAppSecret(secret: InsertGithubAppsSecretSchema) {
  const [insertedSecret] = await db.insert(githubAppSecret).values(secret).returning();
  return insertedSecret;
}

export async function createGithubApp(newGithubApp: InsertGithubAppsSchema) {
  const [insertedGithubApp] = await db.insert(githubApp).values(newGithubApp).returning();
  return insertedGithubApp;
}

export async function updateGithubApp(id: number, updates: Partial<InsertGithubAppsSchema>) {
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

export async function createUser(user: InsertUsersSchema, passwordHash: string) {
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
