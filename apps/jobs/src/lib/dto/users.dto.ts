import { users } from "@delivery/drizzle/schema";
import { z } from "@hono/zod-openapi";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const selectUserSchema = createSelectSchema(users).omit({
  passwordHash: true,
}).extend({
  createdAt: z.string().nullable().or(z.date().nullable()),
  updatedAt: z.string().nullable().or(z.date().nullable()),
  deletedAt: z.string().nullable().or(z.date().nullable()),
  role: z.string(),
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
