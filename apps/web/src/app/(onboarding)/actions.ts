"use server";

import { validatedAction } from "@/lib/auth/middleware";
import { setSession } from "@/lib/auth/session";
import { client } from "@/lib/http";
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
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password } = data;
  const response = await client.users.$post({
    json: {
      email,
      passwordHash: password,
    },
  });
  console.log(response.statusText);
  // Non explicit error message to end-user to prevent from enumeration attack
  if (response.status !== 200) return { error: "Impossible to signup" };
  const createdUser = await response.json();
  await setSession(createdUser);
  redirect("/?step=2");
});

export async function signOut() {
  (await cookies()).delete("session");
}

const githubBatchingSchema = z.object({
  name: z.string(),
  organization: z.coerce.boolean(),
});

export const githubBatching = validatedAction(githubBatchingSchema, async (data, formData) => {
  const { name, organization } = data;
});
