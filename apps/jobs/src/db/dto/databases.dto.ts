import { z } from "@hono/zod-openapi";

import { servicesDto } from "./services.dto";

const database = z.union([
  z.literal("mysql"),
  z.literal("mariadb"),
  z.literal("postgres"),
  z.literal("mongo"),
  z.literal("redis"),
]);

export const createDatabaseSchema = z.object({
  type: database,
  name: z.string(),
});

export const createDatabaseSchemaResp = z.object({
  success: z.literal(true),
});

export const databaseSchema = servicesDto;

export const databaseLinkSchema = z.object({
  environmentKey: z.string().describe("Used environment variable key which contains the database connection URI."),
  applicationName: z.string().describe("Name of the application to link the database to."),
});

export const DatabaseParamsSchema = z.object({
  name: z.string(),
});

export type CreateDatabaseSchema = z.infer<typeof createDatabaseSchema>;
export type DatabaseSchema = z.infer<typeof databaseSchema>;
export type Database = z.infer<typeof database>;
