"use server";

import { validatedAction } from "@/lib/auth/middleware";
import { setSession } from "@/lib/auth/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  // TODO: req to job for signin process, on error return { error: error_message }
  const foundUser = await fetch();

  await setSession(foundUser);

  redirect("/dashboard");
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  inviteId: z.string().optional(),
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password, inviteId } = data;

  // TODO: req to job for signup process, on error return { error: error_message }
  const createdUser = await fetch();

  await setSession(createdUser);

  redirect("/dashboard");
});

export async function signOut() {
  (await cookies()).delete("session");
}
