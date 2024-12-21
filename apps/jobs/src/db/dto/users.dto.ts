import { createInsertSchema, createSelectSchema } from "drizzle-zod";
// eslint-disable-next-line ts/consistent-type-imports
import { z } from "zod";

import { users } from "../schema";

export const selectUsersSchema = createSelectSchema(users).omit({
  passwordHash: true,
});
export const insertUsersSchema = createInsertSchema(users, {
  name: schema => schema.name.min(1).max(500),
})
  .required({
    email: true,
    passwordHash: true,
  })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

export type InsertUsersSchema = z.infer<typeof insertUsersSchema>;
