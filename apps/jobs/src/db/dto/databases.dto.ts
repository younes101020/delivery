import { z } from "@hono/zod-openapi";

export const createDatabaseSchema = z.object({
  type: z.union([
    z.literal("mysql"),
    z.literal("mariadb"),
    z.literal("postgresql"),
    z.literal("mongodb"),
    z.literal("redis"),
    z.literal("sqlite"),
  ]),
});

export const createDatabaseSchemaResp = z.object({
  success: z.literal(true),
});

export type CreateDatabaseSchema = z.infer<typeof createDatabaseSchema>;
