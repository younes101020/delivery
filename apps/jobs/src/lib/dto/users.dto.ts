import { users } from "@delivery/drizzle/schema";
import { z } from "@hono/zod-openapi";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const selectUserSchema = createSelectSchema(users).omit({
  passwordHash: true,
}).extend({
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
  deletedAt: z.string().nullable(),
  emailVerificationTokenExpiresAt: z.string().nullable(),
});
export const insertUserSchema = createInsertSchema(users)
  .omit({
    passwordHash: true,
  })
  .extend({
    password: z.string().min(8).max(100),
  });
export const patchUserSchema = insertUserSchema.partial();

export type InsertUserSchema = z.infer<typeof insertUserSchema>;
export type SelectUserSchema = z.infer<typeof selectUserSchema>;
