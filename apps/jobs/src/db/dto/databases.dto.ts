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
  state: z.union([
    z.literal("created"),
    z.literal("restarting"),
    z.literal("running"),
    z.literal("removing"),
    z.literal("paused"),
    z.literal("exited"),
    z.literal("dead"),
  ]),
  createdAt: z.number(),
  isProcessing: z.boolean(),
});

export const databaseLinkSchema = z.object({
  environmentKey: z.string(),
  applicationId: z.coerce.number(),
});

export type CreateDatabaseSchema = z.infer<typeof createDatabaseSchema>;
export type DatabaseSchema = z.infer<typeof databaseSchema>;
export type Database = z.infer<typeof database>;
