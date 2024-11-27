import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("member"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationTokenExpiresAt: timestamp(
    "email_verification_token_expires_at",
  ),
});

export const githubApp = pgTable("github_app", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  webhookSecret: text("webhook_secret").notNull(),
  clientId: text("client_id").notNull(),
  clientSecret: text("client_secret").notNull(),
  privateKey: text("private_key").notNull(),
  appId: text("app_id").notNull(),
});

export const applications = pgTable("applications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  fqdn: text("fqdn").notNull().unique(),
  logs: text("logs"),
  githubAppId: integer("github_app_id").references(() => githubApp.id),
  githubAppName: text("github_app_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const environmentVariables = pgTable("environment_variables", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  key: text("key").notNull(),
  value: text("value").notNull(),
  isBuildTime: boolean("is_build_time").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const applicationEnvironmentVariables = pgTable(
  "application_environment_variables",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    applicationId: integer("application_id")
      .notNull()
      .references(() => applications.id),
    environmentVariableId: integer("environment_variable_id")
      .notNull()
      .references(() => environmentVariables.id),
  },
);

// DTOs

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

export const selectEnvironmentVariablesSchema = createSelectSchema(environmentVariables);

export const insertEnvironmentVariablesSchema = createInsertSchema(
  environmentVariables,
)
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

// Shared types

export type NewUser = typeof users.$inferSelect;
