import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("member"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationTokenExpiresAt: integer(
    "email_verification_token_expires_at",
    { mode: "timestamp" }
  ),
});

export const applications = sqliteTable("applications", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  fqdn: text("fqdn").notNull().unique(),
  githubRepoUrl: text("github_repo_url").notNull(),
  githubBranch: text("github_branch").notNull(),
  logs: text("logs"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export const environmentVariables = sqliteTable("environment_variables", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  key: text("key").notNull(),
  value: text("value").notNull(),
  isBuildTime: integer("is_build_time", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export const applicationEnvironmentVariables = sqliteTable(
  "application_environment_variables",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    applicationId: integer("application_id")
      .notNull()
      .references(() => applications.id),
    environmentVariableId: integer("environment_variable_id")
      .notNull()
      .references(() => environmentVariables.id),
  }
);

// Zod schemas converters

export const selectUsersSchema = createSelectSchema(users);

export const insertUsersSchema = createInsertSchema(users, {
  name: (schema) => schema.name.min(1).max(500),
})
  .required({
    email: true,
  })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

export const selectApplicationsSchema = createSelectSchema(applications);

export const insertApplicationsSchema = createInsertSchema(applications, {
  name: (schema) => schema.name.min(1).max(500),
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

export const selectEnvironmentVariablesSchema =
  createSelectSchema(environmentVariables);

export const insertEnvironmentVariablesSchema = createInsertSchema(
  environmentVariables
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
  applicationEnvironmentVariables
);

export const insertApplicationEnvironmentVariablesSchema = createInsertSchema(
  applicationEnvironmentVariables
)
  .required({
    applicationId: true,
    environmentVariableId: true,
  })
  .omit({
    id: true,
  });
