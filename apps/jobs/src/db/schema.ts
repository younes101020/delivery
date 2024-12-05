import type { z } from "zod";

import { relations } from "drizzle-orm";
import { boolean, pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const systemConfig = pgTable("system_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  onboardingCompletedAt: timestamp("onboarding_completed_at"),
  completedByUserId: text("completed_by_user_id"),
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

export const githubAppSecret = pgTable("github_app_secret", {
  id: serial("id").primaryKey(),
  encryptedData: text("encrypted_data").notNull(),
  iv: text("iv").notNull(),
  key: text("key").notNull(),
});

export const githubApp = pgTable("github_app", {
  id: serial("id").primaryKey(),
  webhookSecret: text("webhook_secret").notNull(),
  clientId: text("client_id").notNull(),
  clientSecret: text("client_secret").notNull(),
  installationId: serial("installation_id"),
  appId: serial("app_id").notNull(),
  secretId: serial("secret_id").references(() => githubAppSecret.id),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  fqdn: text("fqdn").notNull().unique(),
  logs: text("logs"),
  githubAppId: serial("github_app_id").references(() => githubApp.id),
  githubAppName: text("github_app_name").notNull(),
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
  id: serial("id").primaryKey(),
  applicationId: serial("application_id")
    .notNull()
    .references(() => applications.id),
  environmentVariableId: serial("environment_variable_id")
    .notNull()
    .references(() => environmentVariables.id),
});

export const githubAppRelations = relations(githubApp, ({ one }) => ({
  secret: one(githubAppSecret, {
    fields: [githubApp.secretId],
    references: [githubAppSecret.id],
  }),
}));

// user DTOs
export const selectUsersSchema = createSelectSchema(users).omit({
  passwordHash: true,
});
export const insertUsersSchema = createInsertSchema(users, {
  name: schema => schema.name.min(1).max(500),
})
  .required({
    email: true,
    passwordHash: true,
  })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

// githubapp DTOs
export const selectGithubAppsSchema = createSelectSchema(githubApp);
export const insertGithubAppsSchema = createInsertSchema(githubApp);
export const patchGithubAppsSchema = insertGithubAppsSchema.partial();

// githubAppSecret DTOs & type
export const selectGithubAppSecretSchema = createSelectSchema(githubAppSecret);
export const insertGithubAppSecretSchema = createInsertSchema(githubAppSecret);

// app DTOs
export const selectApplicationsSchema = createSelectSchema(applications);
export const insertApplicationsSchema = createInsertSchema(applications, {
  name: schema => schema.name.min(1).max(500),
})
  .required({
    fqdn: true,
  })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  });
export const patchApplicationsSchema = insertApplicationsSchema.partial();

// envvar DTOs
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
// envvar <=> app join DTOs
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

// Shared types
// workaround to https://github.com/honojs/hono/issues/1800
type NewUserWithoutDateTypes = Omit<
  z.infer<typeof selectUsersSchema>,
  "createdAt" | "updatedAt" | "deletedAt" | "emailVerificationTokenExpiresAt"
>;
export type NewUser = NewUserWithoutDateTypes & {
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
  emailVerificationTokenExpiresAt: string | null;
};
export type GithubInstallation = z.infer<typeof selectGithubAppsSchema>;
