import { z } from "@hono/zod-openapi";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { users } from "../schema";

export const selectUserSchema = createSelectSchema(users).omit({
  passwordHash: true,
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
