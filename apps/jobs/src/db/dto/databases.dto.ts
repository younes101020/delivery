import { z } from "@hono/zod-openapi";

const database = z.union([
  z.literal("mysql"),
  z.literal("mariadb"),
  z.literal("postgresql"),
  z.literal("mongodb"),
  z.literal("redis"),
  z.literal("sqlite"),
]);

export const createDatabaseSchema = z.object({
  type: database,
});

export const createDatabaseSchemaResp = z.object({
  success: z.literal(true),
});

export const databaseJobSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  database,
});

export type CreateDatabaseSchema = z.infer<typeof createDatabaseSchema>;
export type DatabaseJobSchema = z.infer<typeof databaseJobSchema>;
export type Database = z.infer<typeof database>;
