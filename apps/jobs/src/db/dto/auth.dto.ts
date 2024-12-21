import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { users } from "../schema";

export const requiredAuthSchema = createInsertSchema(users).pick({
  email: true,
  passwordHash: true,
});

export const selectUserSchema = createSelectSchema(users).omit({
  passwordHash: true,
});
