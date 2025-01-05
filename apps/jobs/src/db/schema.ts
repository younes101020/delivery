import { relations } from "drizzle-orm";
import { boolean, pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";
// eslint-disable-next-line ts/consistent-type-imports
import { z } from "zod";
// eslint-disable-next-line ts/consistent-type-imports
import { selectGithubAppsSchema } from "./dto/githubapps.dto";
// eslint-disable-next-line ts/consistent-type-imports
import { selectUsersSchema } from "./dto/users.dto";

export const systemConfig = pgTable("system_config", {
  id: uuid("id").primaryKey().defaultRandom(),
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
  port: text("port").notNull(),
  githubAppId: serial("github_app_id").references(() => githubApp.id),
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
