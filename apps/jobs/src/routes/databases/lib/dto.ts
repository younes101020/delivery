import { z } from "@hono/zod-openapi";
import { IdParamsSchema } from "stoker/openapi/schemas";

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

export const databaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  isProcessing: z.boolean(),
  dbConnectionUri: z.string().nullable(),
});

export const databaseService = databaseSchema.extend(
  {
    environmentVariables: z.array(z.string()),
  },
).omit(
  {
    dbConnectionUri: true,
  },
);

export const DatabaseParamsSchema = IdParamsSchema.extend({ id: z.string() }).describe("The database swarm service id.");

export type CreateDatabaseSchema = z.infer<typeof createDatabaseSchema>;
export type DatabaseSchema = z.infer<typeof databaseSchema>;
export type Database = z.infer<typeof database>;

export type DatabaseService = z.infer<typeof databaseService>;
