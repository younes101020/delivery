import type { z } from "zod";

import { relations, sql, type SQL } from "drizzle-orm";
import { boolean, integer, pgTable, primaryKey, serial, text, timestamp } from "drizzle-orm/pg-core";

import type { selectUserSchema } from "./dto";
import type { selectGithubAppsSchema } from "./dto/githubapps.dto";

export const systemConfig = pgTable("system_config", {
  id: serial("id").primaryKey(),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  onboardingCompletedAt: timestamp("onboarding_completed_at"),
  completedByUserId: text("completed_by_user_id"),
  domainName: text("domain_name"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("member"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationTokenExpiresAt: timestamp("email_verification_token_expires_at"),
});

export const githubApp = pgTable("github_app", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  webhookSecret: text("webhook_secret").notNull(),
  clientId: text("client_id").notNull(),
  clientSecret: text("client_secret").notNull(),
  installationId: serial("installation_id"),
  appId: integer("app_id").notNull(),
});

export const githubAppSecret = pgTable("github_app_secret", {
  id: serial("id").primaryKey(),
  encryptedData: text("encrypted_data").notNull(),
  iv: text("iv").notNull(),
  key: text("key").notNull(),
  githubAppId: integer("github_app_id").notNull().references(() => githubApp.id),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  name: text("name")
    .notNull()
    .generatedAlwaysAs((): SQL => sql`split_part(${applications.fqdn}, '.', 1)`),
  fqdn: text("fqdn").notNull().unique(),
  logs: text("logs"),
  port: integer("port").notNull(),
  githubAppId: integer("github_app_id").notNull().references(() => githubApp.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const environmentVariables = pgTable("environment_variables", {
  id: serial("id").primaryKey(),
  key: text("key").notNull(),
  value: text("value").notNull(),
  isBuildTime: boolean("is_build_time").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const applicationEnvironmentVariables = pgTable("application_environment_variables", {
  applicationId: integer("application_id")
    .notNull()
    .references(() => applications.id),
  environmentVariableId: integer("environment_variable_id")
    .notNull()
    .references(() => environmentVariables.id),
}, (t) => { return [{ pk: primaryKey({ columns: [t.applicationId, t.environmentVariableId] }) }]; });

export const applicationEnvironmentVariablesRelations = relations(
  applicationEnvironmentVariables,
  ({ one }) => ({
    application: one(applications, {
      fields: [applicationEnvironmentVariables.applicationId],
      references: [applications.id],
    }),
    environmentVariable: one(environmentVariables, {
      fields: [applicationEnvironmentVariables.environmentVariableId],
      references: [environmentVariables.id],
    }),
  }),
);

export const applicationRelations = relations(applications, ({ many, one }) => ({
  applicationEnvironmentVariables: many(applicationEnvironmentVariables),
  githubApp: one(githubApp, {
    fields: [applications.githubAppId],
    references: [githubApp.id],
  }),
}));

export const environmentVariablesRelations = relations(environmentVariables, ({ many }) => ({
  applicationEnvironmentVariables: many(applicationEnvironmentVariables),
}));

export const githubAppRelations = relations(githubApp, ({ one, many }) => ({
  secret: one(githubAppSecret),
  applications: many(applications),
}));

export const githubAppSecretRelations = relations(githubAppSecret, ({ one }) => ({
  githubApp: one(githubApp, { fields: [githubAppSecret.githubAppId], references: [githubApp.id] }),
}));

// Shared types
// workaround to https://github.com/honojs/hono/issues/1800
type NewUserWithoutDateTypes = Omit<
  z.infer<typeof selectUserSchema>,
  "createdAt" | "updatedAt" | "deletedAt" | "emailVerificationTokenExpiresAt"
>;
export type NewUser = NewUserWithoutDateTypes & {
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
  emailVerificationTokenExpiresAt: string | null;
};
export type GithubInstallation = z.infer<typeof selectGithubAppsSchema>;
