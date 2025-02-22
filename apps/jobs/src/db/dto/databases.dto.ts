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

export const databaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  state: z.string(),
  status: z.string(),
  createdAt: z.number(),
});

export type CreateDatabaseSchema = z.infer<typeof createDatabaseSchema>;
export type DatabaseSchema = z.infer<typeof databaseSchema>;
export type Database = z.infer<typeof database>;
