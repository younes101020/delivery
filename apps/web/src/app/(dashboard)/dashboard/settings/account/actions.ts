"use server";

import { z } from "zod";

import { client } from "@/app/_lib/client-http";
import { getFormChangesAction, validatedActionWithUser } from "@/app/_lib/form-middleware";

const updateAccountSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, prevState, user) => {
    const changes = getFormChangesAction(data, prevState);
    const http = await client();
    const response = await http.users[":id"].$patch({
      param: { id: user.id.toString() },
      json: changes,
    });

    if (response.status !== 200) {
      return {
        error: "Impossible to update your account. Please try again.",
        inputs: data,
      };
    }

    return { success: "Account updated successfully.", inputs: data };
  },
);

const updateSecuritySettingsSchema = z.object({
  "password": z.string().min(8, "Password must be at least 8 characters"),
  "repeat-password": z.string(),
}).refine(data => data.password === data["repeat-password"], {
  message: "Passwords don't match",
  path: ["repeat-password"],
});

export const updateSecuritySettings = validatedActionWithUser(
  updateSecuritySettingsSchema,
  async (data, _, prevState, user) => {
    const http = await client();
    const response = await http.users[":id"].$patch({
      param: { id: user.id.toString() },
      json: { password: data.password },
    });

    if (response.status !== 200) {
      return {
        error: "Impossible to update your security settings. Please try again.",
        inputs: data,
      };
    }

    return { success: "Security settings updated successfully.", inputs: data };
  },
);
