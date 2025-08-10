import { users } from "@delivery/drizzle/schema";
import { z } from "@hono/zod-openapi";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const authRegisterSchema = createInsertSchema(users)
  .omit({ passwordHash: true })
  .extend({
    password: z.string().min(8).max(100),
    invitationId: z.number().optional(),
  });

export const authVerifySchema = createInsertSchema(users)
  .omit({
    passwordHash: true,
  })
  .pick({
    email: true,
  })
  .extend({
    invitationId: z.number().optional(),
    password: z.string().min(8).max(100),
  });

export const userSessionSchema = createSelectSchema(users)
  .pick({ id: true })
  .extend({
    role: z.string(),
  });

export type AuthVerifySchema = z.infer<typeof authVerifySchema>;
export type AuthRegisterSchema = z.infer<typeof authRegisterSchema>;

export type UserSession = z.infer<typeof userSessionSchema>;
