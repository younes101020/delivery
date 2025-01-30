import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { users } from "../schema";

export const authRegisterSchema = createInsertSchema(users)
  .omit({ passwordHash: true })
  .extend({ password: z.string().min(8).max(100) });

export const authVerifySchema = createInsertSchema(users)
  .omit({ passwordHash: true })
  .extend({ password: z.string().min(8).max(100) })
  .pick({
    email: true,
    password: true,
  });

export type AuthVerifySchema = z.infer<typeof authVerifySchema>;
export type AuthRegisterSchema = z.infer<typeof authRegisterSchema>;
